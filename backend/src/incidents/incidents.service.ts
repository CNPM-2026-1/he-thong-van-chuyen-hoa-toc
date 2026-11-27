import { Injectable } from '@nestjs/common';
import {
  IncidentStatus,
  MediaPurpose,
  NotificationType,
  OrderStatus,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { IdempotencyService } from '../common/idempotency.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginated, skipTake } from '../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateIncidentDto, ListIncidentsQueryDto, UpdateIncidentDto } from './dto/incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly realtime: RealtimeGateway,
    private readonly notifications: NotificationsService,
  ) {}

  async list(query: ListIncidentsQueryDto, user: User) {
    const where: Prisma.IncidentWhereInput = {
      status: query.status,
      severity: query.severity,
      ...(query.search?.trim()
        ? { description: { contains: query.search.trim(), mode: 'insensitive' } }
        : {}),
    };
    if (user.role === Role.DRIVER) {
      const driver = await this.prisma.driver.findFirst({
        where: { userId: user.id, isActive: true, deletedAt: null },
      });
      if (!driver) throw ApiException.forbidden('FORBIDDEN', 'Tài khoản chưa có hồ sơ tài xế');
      where.trip = { is: { driverId: driver.id } };
    } else if (user.role === Role.STAFF) {
      throw ApiException.forbidden(
        'ASSIGNMENT_SCOPE_NOT_CONFIGURED',
        'Chưa có dữ liệu phân công nhân viên theo bến để giới hạn danh sách sự cố',
      );
    } else if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Không có quyền xem danh sách sự cố');
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.incident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...skipTake(query),
      }),
      this.prisma.incident.count({ where }),
    ]);
    return paginated(items.map((item) => this.toResponse(item)), query.page, total);
  }

  async get(id: string, user: User) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw ApiException.notFound('Không tìm thấy sự cố');
    await this.assertCanView(incident.tripId, user);
    return this.toResponse(incident);
  }

  async create(dto: CreateIncidentDto, user: User, key: string | undefined) {
    if (!dto.orderId && !dto.tripId) {
      throw ApiException.badRequest('VALIDATION_ERROR', 'Sự cố phải gắn với orderId hoặc tripId');
    }
    const result = await this.idempotency.execute(
      user.id,
      'POST:/incidents',
      key,
      dto,
      async (tx) => {
        let tripId = dto.tripId ?? null;
        if (dto.tripId) {
          const trip = await tx.trip.findUnique({ where: { id: dto.tripId } });
          if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');
          await this.assertDriverTripTx(tx, trip.id, user);
        }

        let order = dto.orderId
          ? await tx.order.findUnique({ where: { id: dto.orderId } })
          : null;
        if (dto.orderId && !order) throw ApiException.notFound('Không tìm thấy đơn hàng');

        if (order && user.role === Role.DRIVER) {
          const driver = await tx.driver.findFirst({
            where: {
              userId: user.id,
              isActive: true,
              deletedAt: null,
            },
          });
          if (!driver) {
            throw ApiException.forbidden('FORBIDDEN', 'Tài khoản chưa có hồ sơ tài xế đang hoạt động');
          }
          const assignment = await tx.manifestItem.findFirst({
            where: {
              package: { is: { orderId: order.id } },
              manifest: {
                is: {
                  trip: { is: { driverId: driver.id } },
                },
              },
            },
            include: { manifest: { include: { trip: true } } },
          });
          if (!assignment || (tripId && assignment.manifest.tripId !== tripId)) {
            throw ApiException.forbidden('FORBIDDEN', 'Đơn hàng không thuộc chuyến được phân công');
          }
          tripId = assignment.manifest.tripId;
        }

        if (order && tripId) {
          const assignedTrip = await tx.trip.findUnique({
            where: { id: tripId },
            include: { route: true },
          });
          if (!assignedTrip) throw ApiException.notFound('Không tìm thấy chuyến xe');
          if (
            order.originStationId !== assignedTrip.route.originStationId ||
            order.destinationStationId !== assignedTrip.route.destinationStationId
          ) {
            throw ApiException.conflict(
              'ORDER_TRIP_ROUTE_MISMATCH',
              'Đơn hàng không thuộc tuyến của chuyến xe được gắn sự cố',
            );
          }
        }

        if (user.role === Role.STAFF) {
          throw ApiException.forbidden(
            'ASSIGNMENT_SCOPE_NOT_CONFIGURED',
            'Chưa có dữ liệu phân công nhân viên theo bến để kiểm tra quyền báo sự cố',
          );
        }
        if (user.role !== Role.DRIVER && user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
          throw ApiException.forbidden('FORBIDDEN', 'Không có quyền tạo sự cố');
        }

        const photoObjectKeys = dto.photoObjectKeys ?? [];
        if (photoObjectKeys.length > 0) {
          const media = await tx.mediaObject.findMany({
            where: {
              objectKey: { in: photoObjectKeys },
              uploadedById: user.id,
              purpose: MediaPurpose.INCIDENT_EVIDENCE,
            },
            select: { objectKey: true },
          });
          if (media.length !== new Set(photoObjectKeys).size) {
            throw ApiException.badRequest('VALIDATION_ERROR', 'Ảnh chứng cứ không hợp lệ hoặc không thuộc tài khoản hiện tại');
          }
        }

        let previousStatus: OrderStatus | null = null;
        if (order && order.status !== OrderStatus.INCIDENT_HOLD) {
          previousStatus = order.status;
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.INCIDENT_HOLD, version: { increment: 1 } },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              changedById: user.id,
              fromStatus: order.status,
              toStatus: OrderStatus.INCIDENT_HOLD,
              reason: 'Đơn hàng được tạm giữ để xử lý sự cố',
            },
          });
        } else if (order) {
          const unresolved = await tx.incident.findFirst({
            where: { orderId: order.id, status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] } },
            orderBy: { createdAt: 'asc' },
          });
          previousStatus = unresolved?.orderPreviousStatus ?? OrderStatus.IN_TRANSIT;
        }

        const incident = await tx.incident.create({
          data: {
            type: dto.type,
            severity: dto.severity,
            orderId: order?.id,
            tripId,
            reportedById: user.id,
            description: dto.description,
            orderPreviousStatus: previousStatus,
            photoObjectKeys: photoObjectKeys as Prisma.InputJsonValue,
          },
        });

        const customerNotification = order
          ? await tx.notification.create({
              data: {
                userId: order.customerId,
                orderId: order.id,
                type: NotificationType.INCIDENT,
                title: 'Đơn hàng đang được xử lý sự cố',
                body: `Đơn ${order.trackingCode} phát sinh sự cố và đang được bộ phận vận hành xử lý`,
                resourceType: 'order',
                resourceId: order.id,
              },
            })
          : null;

        return { incident, customerNotification, trackingCode: order?.trackingCode ?? null };
      },
    );

    if (result.customerNotification) {
      this.emitNotification(result.customerNotification);
    }
    if (result.incident.tripId) {
      this.realtime.emitToTrip(result.incident.tripId, 'incident:created', {
        incidentId: result.incident.id,
        orderId: result.incident.orderId,
        tripId: result.incident.tripId,
        type: result.incident.type,
        severity: result.incident.severity,
        reportedBy: result.incident.reportedById,
        createdAt: result.incident.createdAt,
      });
    }
    if (result.incident.orderId) {
      this.realtime.emitToOrder(result.incident.orderId, 'incident:created', {
        incidentId: result.incident.id,
        orderId: result.incident.orderId,
        tripId: result.incident.tripId,
        type: result.incident.type,
        severity: result.incident.severity,
        reportedBy: result.incident.reportedById,
        createdAt: result.incident.createdAt,
      });
    }
    await this.notifications.notifyManagers({
      type: NotificationType.INCIDENT,
      title: 'Có sự cố vận hành mới',
      body: result.incident.description,
      resourceType: 'incident',
      resourceId: result.incident.id,
      orderId: result.incident.orderId ?? undefined,
    });
    return this.toResponse(result.incident);
  }

  async update(id: string, dto: UpdateIncidentDto, user: User) {
    if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ MANAGER hoặc ADMIN được xử lý sự cố');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const incident = await tx.incident.findUnique({ where: { id } });
      if (!incident) throw ApiException.notFound('Không tìm thấy sự cố');
      if (incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED) {
        throw ApiException.conflict('INCIDENT_ALREADY_CLOSED', 'Sự cố đã được xử lý hoặc đóng');
      }

      const updated = await tx.incident.update({
        where: { id },
        data: {
          status: dto.status,
          severity: dto.severity,
          resolution: dto.resolution,
        },
      });

      let orderStatusChanged: {
        from: OrderStatus;
        to: OrderStatus;
        orderId: string;
        trackingCode: string;
        version: number;
      } | null = null;

      if ((dto.status === IncidentStatus.RESOLVED || dto.status === IncidentStatus.CLOSED) && incident.orderId) {
        const order = await tx.order.findUnique({ where: { id: incident.orderId } });
        if (order && order.status === OrderStatus.INCIDENT_HOLD) {
          const otherOpenIncidents = await tx.incident.count({
            where: {
              orderId: order.id,
              id: { not: incident.id },
              status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] },
            },
          });

          // Do not release the order while another incident still requires action.
          if (otherOpenIncidents === 0) {
            if (!dto.orderResolution) {
              throw ApiException.badRequest(
                'VALIDATION_ERROR',
                'Khi xử lý xong sự cố cuối cùng của đơn hàng, phải chọn orderResolution=RESUME hoặc RETURN',
              );
            }
            const target =
              dto.orderResolution === 'RETURN'
                ? OrderStatus.RETURNING
                : incident.orderPreviousStatus ?? OrderStatus.IN_TRANSIT;
            if (target === OrderStatus.INCIDENT_HOLD) {
              throw ApiException.conflict('INVALID_ORDER_RESOLUTION', 'Không thể khôi phục về INCIDENT_HOLD');
            }

            const updatedOrder = await tx.order.update({
              where: { id: order.id },
              data: { status: target, version: { increment: 1 } },
            });
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                changedById: user.id,
                fromStatus: OrderStatus.INCIDENT_HOLD,
                toStatus: target,
                reason: dto.resolution,
              },
            });
            orderStatusChanged = {
              from: OrderStatus.INCIDENT_HOLD,
              to: target,
              orderId: order.id,
              trackingCode: order.trackingCode,
              version: updatedOrder.version,
            };
          }
        }
      }

      const customerNotification = incident.orderId
        ? await tx.order.findUnique({ where: { id: incident.orderId } }).then((order) =>
            order
              ? tx.notification.create({
                  data: {
                    userId: order.customerId,
                    orderId: order.id,
                    type: NotificationType.INCIDENT,
                    title: 'Cập nhật xử lý sự cố',
                    body: dto.resolution ?? `Sự cố của đơn ${order.trackingCode} đã được cập nhật`,
                    resourceType: 'order',
                    resourceId: order.id,
                  },
                })
              : null,
          )
        : null;

      return { updated, orderStatusChanged, customerNotification };
    });

    if (result.customerNotification) this.emitNotification(result.customerNotification);
    if (result.updated.tripId) {
      this.realtime.emitToTrip(result.updated.tripId, 'incident:updated', {
        incidentId: result.updated.id,
        status: result.updated.status,
        resolution: result.updated.resolution,
        updatedAt: result.updated.updatedAt,
        updatedBy: user.id,
      });
    }
    if (result.updated.orderId) {
      this.realtime.emitToOrder(result.updated.orderId, 'incident:updated', {
        incidentId: result.updated.id,
        status: result.updated.status,
        resolution: result.updated.resolution,
        updatedAt: result.updated.updatedAt,
        updatedBy: user.id,
      });
    }
    if (result.orderStatusChanged) {
      this.realtime.emitToOrder(result.orderStatusChanged.orderId, 'order:status_changed', {
        orderId: result.orderStatusChanged.orderId,
        trackingCode: result.orderStatusChanged.trackingCode,
        fromStatus: result.orderStatusChanged.from,
        toStatus: result.orderStatusChanged.to,
        actorId: user.id,
        reason: dto.resolution,
      }, result.orderStatusChanged.version);
    }
    return this.toResponse(result.updated);
  }

  private async assertCanView(tripId: string | null, user: User) {
    if (user.role === Role.MANAGER || user.role === Role.ADMIN) return;
    if (user.role === Role.DRIVER && tripId) {
      const driver = await this.prisma.driver.findFirst({
        where: { userId: user.id, isActive: true, deletedAt: null },
      });
      const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
      if (driver && trip?.driverId === driver.id) return;
    }
    throw ApiException.forbidden('FORBIDDEN', 'Bạn không có quyền xem sự cố này');
  }

  private async assertDriverTripTx(tx: Prisma.TransactionClient, tripId: string, user: User) {
    if (user.role === Role.MANAGER || user.role === Role.ADMIN) return;
    if (user.role !== Role.DRIVER) {
      throw ApiException.forbidden('FORBIDDEN', 'Không có quyền thao tác sự cố trên chuyến');
    }
    const driver = await tx.driver.findFirst({ where: { userId: user.id, isActive: true, deletedAt: null } });
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!driver || trip?.driverId !== driver.id) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn chỉ được báo sự cố cho chuyến được phân công');
    }
  }

  private emitNotification(notification: {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    orderId: string | null;
    resourceType: string | null;
    resourceId: string | null;
    createdAt: Date;
  }) {
    this.realtime.emitToUser(notification.userId, 'notification:new', {
      notificationId: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      orderId: notification.orderId,
      resourceType: notification.resourceType,
      resourceId: notification.resourceId,
      createdAt: notification.createdAt,
    });
  }

  private toResponse(incident: {
    id: string;
    type: any;
    severity: any;
    status: any;
    orderId: string | null;
    tripId: string | null;
    reportedById: string;
    description: string;
    resolution: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: incident.id,
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      orderId: incident.orderId,
      tripId: incident.tripId,
      reportedBy: incident.reportedById,
      description: incident.description,
      resolution: incident.resolution,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    };
  }
}
