import { Injectable } from '@nestjs/common';
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  ManifestItemStatus,
  ManifestStatus,
  NotificationType,
  OrderStatus,
  Role,
  TripStatus,
  User,
} from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { IdempotencyService } from '../common/idempotency.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddManifestOrderDto, UpdateManifestItemDto } from './dto/manifest.dto';

const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  TripStatus.PLANNED,
  TripStatus.BOARDING,
  TripStatus.DISPATCHED,
  TripStatus.IN_TRANSIT,
  TripStatus.ARRIVED,
];

@Injectable()
export class ManifestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly realtime: RealtimeGateway,
    private readonly notifications: NotificationsService,
  ) {}

  async getManifest(tripId: string, user: User) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');
    await this.assertCanOperateTrip(tripId, user);

    const manifest = await this.prisma.manifest.findUnique({
      where: { tripId },
      include: {
        items: {
          include: {
            package: { include: { order: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const items = manifest?.items.map((item) => ({
      id: item.id,
      tripId,
      orderId: item.package.orderId,
      trackingCode: item.package.order.trackingCode,
      packageId: item.packageId,
      packageCode: item.package.packageCode,
      status: item.status,
      scannedAt: item.scannedAt,
      loadedAt: item.loadedAt,
      unloadedAt: item.unloadedAt,
    })) ?? [];

    return {
      tripId,
      manifestId: manifest?.id ?? null,
      code: manifest?.code ?? null,
      status: manifest?.status ?? ManifestStatus.OPEN,
      items,
      totalItems: items.length,
      loadedItems: items.filter((item) => item.status === ManifestItemStatus.LOADED || item.status === ManifestItemStatus.UNLOADED).length,
      unloadedItems: items.filter((item) => item.status === ManifestItemStatus.UNLOADED).length,
    };
  }

  async addOrderToManifest(
    tripId: string,
    dto: AddManifestOrderDto,
    user: User,
    idempotencyKey: string | undefined,
  ) {
    this.assertManagerOrAdmin(user);

    const result = await this.idempotency.execute(
      user.id,
      `POST:/trips/${tripId}/manifest/items`,
      idempotencyKey,
      { tripId, ...dto },
      async (tx) => {
        const trip = await tx.trip.findUnique({
          where: { id: tripId },
          include: { route: true },
        });
        if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');
        if (trip.status !== TripStatus.PLANNED && trip.status !== TripStatus.BOARDING) {
          throw ApiException.conflict('MANIFEST_LOCKED', 'Không thể sửa manifest sau khi chuyến đã xuất bến');
        }

        const order = await tx.order.findUnique({
          where: { id: dto.orderId },
          include: { packages: true },
        });
        if (!order) throw ApiException.notFound('Không tìm thấy đơn hàng');
        if (order.status !== OrderStatus.RECEIVED && order.status !== OrderStatus.WAITING_FOR_DISPATCH) {
          throw ApiException.conflict(
            'ORDER_NOT_READY_FOR_DISPATCH',
            'Chỉ thêm đơn đã được tiếp nhận và đang chờ điều phối vào manifest',
          );
        }
        if (
          order.originStationId !== trip.route.originStationId ||
          order.destinationStationId !== trip.route.destinationStationId
        ) {
          throw ApiException.conflict('ROUTE_MISMATCH', 'Đơn hàng không thuộc tuyến của chuyến xe');
        }
        if (order.packages.length !== order.packageCount || order.packages.length === 0) {
          throw ApiException.conflict(
            'PACKAGE_RECORDS_INCOMPLETE',
            'Số kiện trong CSDL chưa khớp packageCount; Bộ 1 cần tạo đủ Package khi tạo đơn',
          );
        }

        const manifest = await tx.manifest.upsert({
          where: { tripId },
          update: {},
          create: {
            tripId,
            code: `MAN-${trip.code}`,
            createdById: user.id,
          },
        });
        if (manifest.status !== ManifestStatus.OPEN) {
          throw ApiException.conflict('MANIFEST_CLOSED', 'Manifest đã đóng');
        }

        const packageIds = order.packages.map((item) => item.id);
        const activeAssignment = await tx.manifestItem.findFirst({
          where: {
            packageId: { in: packageIds },
            manifest: {
              is: {
                trip: { is: { status: { in: ACTIVE_TRIP_STATUSES } } },
              },
            },
          },
          include: { manifest: { include: { trip: true } } },
        });
        if (activeAssignment) {
          if (activeAssignment.manifest.tripId === tripId) {
            throw ApiException.conflict('PACKAGE_ALREADY_IN_MANIFEST', 'Một hoặc nhiều kiện đã có trong manifest này');
          }
          throw ApiException.conflict('PACKAGE_ASSIGNED_TO_ACTIVE_TRIP', 'Một hoặc nhiều kiện đang nằm trong chuyến chưa kết thúc');
        }

        const created = await tx.manifestItem.createMany({
          data: order.packages.map((item) => ({
            manifestId: manifest.id,
            packageId: item.id,
            status: ManifestItemStatus.PENDING_LOAD,
          })),
        });

        if (order.status === OrderStatus.RECEIVED) {
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.WAITING_FOR_DISPATCH, version: { increment: 1 } },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              changedById: user.id,
              fromStatus: OrderStatus.RECEIVED,
              toStatus: OrderStatus.WAITING_FOR_DISPATCH,
              reason: 'Thêm kiện hàng vào manifest chuyến xe',
            },
          });
        }

        await tx.manifest.update({
          where: { id: manifest.id },
          data: { version: { increment: 1 } },
        });
        const updatedTrip = await tx.trip.update({
          where: { id: trip.id },
          data: { version: { increment: 1 } },
        });

        const items = await tx.manifestItem.findMany({
          where: { manifestId: manifest.id, packageId: { in: packageIds } },
          include: { package: { include: { order: true } } },
          orderBy: { createdAt: 'asc' },
        });

        return {
          tripId,
          manifestId: manifest.id,
          addedCount: created.count,
          resourceVersion: updatedTrip.version,
          items: items.map((item) => ({
            id: item.id,
            tripId,
            orderId: item.package.orderId,
            trackingCode: item.package.order.trackingCode,
            packageId: item.packageId,
            packageCode: item.package.packageCode,
            status: item.status,
            scannedAt: item.scannedAt,
          })),
        };
      },
    );

    this.realtime.emitToTrip(
      tripId,
      'manifest:updated',
      {
        tripId,
        manifestId: result.manifestId,
        addedCount: result.addedCount,
      },
      result.resourceVersion,
    );
    return result;
  }

  async updateItem(itemId: string, dto: UpdateManifestItemDto, user: User) {
    const current = await this.prisma.manifestItem.findUnique({
      where: { id: itemId },
      include: {
        package: { include: { order: true } },
        manifest: { include: { trip: true } },
      },
    });
    if (!current) throw ApiException.notFound('Không tìm thấy kiện trong manifest');

    await this.assertCanOperateTrip(current.manifest.tripId, user);
    const trip = current.manifest.trip;
    const order = current.package.order;

    const allowed =
      (current.status === ManifestItemStatus.PENDING_LOAD &&
        (dto.status === ManifestItemStatus.LOADED ||
          dto.status === ManifestItemStatus.MISSING ||
          dto.status === ManifestItemStatus.DAMAGED)) ||
      (current.status === ManifestItemStatus.LOADED &&
        (dto.status === ManifestItemStatus.UNLOADED ||
          dto.status === ManifestItemStatus.MISSING ||
          dto.status === ManifestItemStatus.DAMAGED));

    if (!allowed) {
      throw ApiException.conflict(
        'INVALID_MANIFEST_ITEM_TRANSITION',
        `Không thể chuyển kiện từ ${current.status} sang ${dto.status}`,
      );
    }
    if (dto.status === ManifestItemStatus.LOADED && trip.status !== TripStatus.PLANNED && trip.status !== TripStatus.BOARDING) {
      throw ApiException.conflict('TRIP_NOT_BOARDING', 'Chỉ xếp kiện khi chuyến chưa xuất bến');
    }
    if (dto.status === ManifestItemStatus.UNLOADED && trip.status !== TripStatus.ARRIVED) {
      throw ApiException.conflict('TRIP_NOT_ARRIVED', 'Chỉ dỡ kiện sau khi chuyến đến bến đích');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const itemUpdate = await tx.manifestItem.updateMany({
        where: { id: current.id, status: current.status },
        data: {
          status: dto.status,
          scannedById: user.id,
          scannedAt: now,
          note: dto.note,
          ...(dto.status === ManifestItemStatus.LOADED ? { loadedAt: now } : {}),
          ...(dto.status === ManifestItemStatus.UNLOADED ? { unloadedAt: now } : {}),
        },
      });
      if (itemUpdate.count !== 1) {
        throw ApiException.conflict(
          'MANIFEST_ITEM_CHANGED',
          'Kiện hàng vừa được cập nhật bởi thao tác khác; hãy tải lại manifest',
        );
      }
      const item = await tx.manifestItem.findUniqueOrThrow({ where: { id: current.id } });

      await tx.manifest.update({
        where: { id: current.manifestId },
        data: { version: { increment: 1 } },
      });
      const updatedTrip = await tx.trip.update({
        where: { id: trip.id },
        data: { version: { increment: 1 } },
      });
      // Refresh inside the transaction: a concurrent scan may have put this order on INCIDENT_HOLD.
      const currentOrder = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
      let orderVersion = currentOrder.version;

      let orderStatusChanged = false;
      let createdIncident: Incident | null = null;
      if (dto.status === ManifestItemStatus.MISSING || dto.status === ManifestItemStatus.DAMAGED) {
        let previousOrderStatus = currentOrder.status;
        if (currentOrder.status === OrderStatus.INCIDENT_HOLD) {
          const existingIncident = await tx.incident.findFirst({
            where: {
              orderId: order.id,
              status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] },
            },
            orderBy: { createdAt: 'asc' },
          });
          previousOrderStatus = existingIncident?.orderPreviousStatus ?? OrderStatus.IN_TRANSIT;
        } else {
          const changedOrder = await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.INCIDENT_HOLD, version: { increment: 1 } },
          });
          orderVersion = changedOrder.version;
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              changedById: user.id,
              fromStatus: currentOrder.status,
              toStatus: OrderStatus.INCIDENT_HOLD,
              reason: dto.note ?? `Kiện ${current.package.packageCode} ${dto.status}`,
            },
          });
          orderStatusChanged = true;
        }
        createdIncident = await tx.incident.create({
          data: {
            type: dto.status === ManifestItemStatus.DAMAGED ? IncidentType.DAMAGED_PACKAGE : IncidentType.LOST_PACKAGE,
            severity: IncidentSeverity.MEDIUM,
            status: IncidentStatus.OPEN,
            orderId: order.id,
            tripId: trip.id,
            reportedById: user.id,
            description: dto.note ?? `Kiện ${current.package.packageCode} ${dto.status}`,
            orderPreviousStatus: previousOrderStatus,
          },
        });
      }

      if (dto.status === ManifestItemStatus.UNLOADED) {
        const remaining = await tx.manifestItem.count({
          where: {
            manifestId: current.manifestId,
            package: { is: { orderId: order.id } },
            status: { not: ManifestItemStatus.UNLOADED },
          },
        });
        if (remaining === 0 && currentOrder.status === OrderStatus.IN_TRANSIT) {
          const changedOrder = await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.AT_DESTINATION, version: { increment: 1 } },
          });
          orderVersion = changedOrder.version;
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              changedById: user.id,
              fromStatus: OrderStatus.IN_TRANSIT,
              toStatus: OrderStatus.AT_DESTINATION,
              reason: 'Toàn bộ kiện hàng đã được dỡ tại bến đích',
            },
          });
          orderStatusChanged = true;
        }
      }

      return { item, orderStatusChanged, incident: createdIncident, tripVersion: updatedTrip.version, orderVersion };
    });

    const eventData = {
      tripId: trip.id,
      manifestItemId: updated.item.id,
      orderId: order.id,
      trackingCode: order.trackingCode,
      packageId: current.packageId,
      packageCode: current.package.packageCode,
      action: dto.status,
      scannedBy: user.id,
      scannedAt: updated.item.scannedAt,
    };
    this.realtime.emitToTrip(trip.id, 'manifest:item_scanned', eventData, updated.tripVersion);
    this.realtime.emitToOrder(order.id, 'manifest:item_scanned', eventData, updated.orderVersion);

    if (updated.incident) {
      const incidentEvent = {
        incidentId: updated.incident.id,
        orderId: updated.incident.orderId,
        tripId: updated.incident.tripId,
        type: updated.incident.type,
        severity: updated.incident.severity,
        reportedBy: updated.incident.reportedById,
        createdAt: updated.incident.createdAt,
      };
      this.realtime.emitToTrip(trip.id, 'incident:created', incidentEvent);
      this.realtime.emitToOrder(order.id, 'incident:created', incidentEvent);
      await this.notifications.notifyManagers({
        type: NotificationType.INCIDENT,
        title: 'Có kiện hàng thiếu/hỏng trong chuyến',
        body: updated.incident.description,
        resourceType: 'incident',
        resourceId: updated.incident.id,
        orderId: order.id,
      });
    }

    return {
      id: updated.item.id,
      tripId: trip.id,
      orderId: order.id,
      trackingCode: order.trackingCode,
      packageId: current.packageId,
      packageCode: current.package.packageCode,
      status: updated.item.status,
      scannedAt: updated.item.scannedAt,
    };
  }

  private async assertCanOperateTrip(tripId: string, user: User) {
    if (user.role === Role.MANAGER || user.role === Role.ADMIN) return;
    if (user.role === Role.DRIVER) {
      const driver = await this.prisma.driver.findFirst({
        where: { userId: user.id, isActive: true, deletedAt: null },
      });
      const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
      if (driver && trip?.driverId === driver.id) return;
      throw ApiException.forbidden('FORBIDDEN', 'Bạn chỉ được thao tác manifest của chuyến được phân công');
    }
    if (user.role === Role.STAFF) {
      throw ApiException.forbidden(
        'ASSIGNMENT_SCOPE_NOT_CONFIGURED',
        'Chưa có bảng phân công nhân viên theo bến; không thể cấp quyền thao tác manifest',
      );
    }
    throw ApiException.forbidden('FORBIDDEN', 'Không có quyền thao tác manifest');
  }

  private assertManagerOrAdmin(user: User) {
    if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ MANAGER hoặc ADMIN được điều phối manifest');
    }
  }
}
