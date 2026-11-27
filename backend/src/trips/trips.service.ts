import { Injectable } from '@nestjs/common';
import { ManifestItemStatus, ManifestStatus, OrderStatus, Prisma, Role, TripStatus, User, VehicleStatus } from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { IdempotencyService } from '../common/idempotency.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { paginated, skipTake } from '../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto, ListTripsQueryDto, UpdateTripStatusDto } from './dto/trip.dto';

const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  TripStatus.PLANNED,
  TripStatus.BOARDING,
  TripStatus.DISPATCHED,
  TripStatus.IN_TRANSIT,
  TripStatus.ARRIVED,
];

const ALLOWED_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.PLANNED]: [TripStatus.BOARDING, TripStatus.CANCELLED],
  [TripStatus.BOARDING]: [TripStatus.DISPATCHED, TripStatus.CANCELLED],
  [TripStatus.DISPATCHED]: [TripStatus.IN_TRANSIT],
  [TripStatus.IN_TRANSIT]: [TripStatus.ARRIVED],
  [TripStatus.ARRIVED]: [TripStatus.COMPLETED],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
};

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async list(query: ListTripsQueryDto, user: User) {
    this.assertRoleCanReadTrips(user);
    const where: Prisma.TripWhereInput = {
      ...(query.search?.trim()
        ? { code: { contains: query.search.trim(), mode: 'insensitive' } }
        : {}),
    };

    if (user.role === Role.DRIVER) {
      const driver = await this.findDriverForUser(user.id);
      where.driverId = driver.id;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({
        where,
        orderBy: { plannedDepartureAt: 'desc' },
        ...skipTake(query),
      }),
      this.prisma.trip.count({ where }),
    ]);
    return paginated(items, query.page, total);
  }

  async get(tripId: string, user: User) {
    this.assertRoleCanReadTrips(user);
    const trip = await this.findTripOrThrow(tripId);

    if (user.role === Role.DRIVER) {
      const driver = await this.findDriverForUser(user.id);
      if (trip.driverId !== driver.id) {
        throw ApiException.forbidden('FORBIDDEN', 'Bạn chỉ được xem chuyến xe được phân công');
      }
    }
    return trip;
  }

  async create(dto: CreateTripDto, user: User, idempotencyKey: string | undefined) {
    this.assertManagerOrAdmin(user);

    const departure = new Date(dto.plannedDepartureAt);
    const arrival = dto.plannedArrivalAt ? new Date(dto.plannedArrivalAt) : null;
    if (arrival && arrival <= departure) {
      throw ApiException.badRequest(
        'VALIDATION_ERROR',
        'plannedArrivalAt phải sau plannedDepartureAt',
      );
    }

    try {
      return await this.idempotency.execute(
        user.id,
        'POST:/trips',
        idempotencyKey,
        dto,
        async (tx) => {
          const [route, vehicle, driver] = await Promise.all([
            tx.route.findFirst({
              where: { id: dto.routeId, deletedAt: null, isActive: true },
            }),
            tx.vehicle.findFirst({
              where: { id: dto.vehicleId, deletedAt: null, isActive: true },
            }),
            tx.driver.findFirst({
              where: { id: dto.driverId, deletedAt: null, isActive: true },
              include: { user: true },
            }),
          ]);

          if (!route) throw ApiException.notFound('Không tìm thấy tuyến đang hoạt động');
          if (!vehicle) throw ApiException.notFound('Không tìm thấy xe đang hoạt động');
          if (
            !driver ||
            driver.user.deletedAt ||
            driver.user.status !== 'ACTIVE' ||
            driver.user.role !== Role.DRIVER
          ) {
            throw ApiException.badRequest(
              'VALIDATION_ERROR',
              'Tài xế không tồn tại hoặc không còn hoạt động',
            );
          }
          if (vehicle.status !== VehicleStatus.AVAILABLE) {
            throw ApiException.conflict('VEHICLE_UNAVAILABLE', 'Xe không ở trạng thái sẵn sàng');
          }

          const estimatedArrival =
            arrival ??
            new Date(departure.getTime() + route.estimatedDurationMinutes * 60 * 1000);
          const assignmentConflict = await tx.trip.count({
            where: {
              status: { in: ACTIVE_TRIP_STATUSES },
              OR: [{ vehicleId: vehicle.id }, { driverId: driver.id }],
              AND: [
                { plannedDepartureAt: { lt: estimatedArrival } },
                {
                  OR: [
                    { plannedArrivalAt: null },
                    { plannedArrivalAt: { gt: departure } },
                  ],
                },
              ],
            },
          });
          if (assignmentConflict > 0) {
            throw ApiException.conflict(
              'TRIP_ASSIGNMENT_CONFLICT',
              'Xe hoặc tài xế đang được phân công vào một chuyến có lịch trùng',
            );
          }

          const trip = await tx.trip.create({
            data: {
              code: dto.code,
              routeId: route.id,
              vehicleId: vehicle.id,
              driverId: driver.id,
              plannedDepartureAt: departure,
              plannedArrivalAt: arrival,
              status: TripStatus.PLANNED,
            },
          });

          await tx.tripStatusHistory.create({
            data: {
              tripId: trip.id,
              changedById: user.id,
              fromStatus: null,
              toStatus: TripStatus.PLANNED,
              note: 'Khởi tạo chuyến xe',
            },
          });

          return trip;
        },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw ApiException.conflict('DUPLICATE', 'Mã chuyến xe đã tồn tại');
      }
      throw error;
    }
  }

  async updateStatus(tripId: string, dto: UpdateTripStatusDto, user: User) {
    if (user.role !== Role.DRIVER && user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn không có quyền cập nhật trạng thái chuyến');
    }

    const orderEvents: Array<{
      id: string;
      trackingCode: string;
      fromStatus: OrderStatus;
      toStatus: OrderStatus;
      version: number;
    }> = [];

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const trip = await tx.trip.findUnique({ where: { id: tripId } });
        if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');

        if (user.role === Role.DRIVER) {
          const driver = await tx.driver.findFirst({
            where: { userId: user.id, deletedAt: null, isActive: true },
          });
          if (!driver || trip.driverId !== driver.id) {
            throw ApiException.forbidden(
              'FORBIDDEN',
              'Bạn chỉ được cập nhật chuyến xe được phân công',
            );
          }
        }

        const allowed = ALLOWED_TRANSITIONS[trip.status] ?? [];
        if (!allowed.includes(dto.status)) {
          throw ApiException.conflict(
            'INVALID_TRIP_STATUS_TRANSITION',
            `Không thể chuyển trạng thái chuyến từ ${trip.status} sang ${dto.status}`,
          );
        }

        const now = new Date();
        let manifestId: string | null = null;
        if (dto.status === TripStatus.DISPATCHED) {
          const manifest = await tx.manifest.findUnique({
            where: { tripId: trip.id },
          });
          if (!manifest) {
            throw ApiException.conflict(
              'MANIFEST_REQUIRED',
              'Cần tạo manifest và thêm kiện hàng trước khi xuất bến',
            );
          }
          manifestId = manifest.id;
          const totalItems = await tx.manifestItem.count({ where: { manifestId } });
          const loadedItems = await tx.manifestItem.count({
            where: { manifestId, status: ManifestItemStatus.LOADED },
          });
          if (totalItems === 0 || loadedItems !== totalItems) {
            throw ApiException.conflict(
              'MANIFEST_NOT_READY',
              'Tất cả kiện trong manifest phải được xác nhận LOADED trước khi xuất bến',
            );
          }

          const manifestItems = await tx.manifestItem.findMany({
            where: { manifestId },
            include: { package: { include: { order: true } } },
          });
          const orders = new Map(manifestItems.map((item) => [item.package.order.id, item.package.order]));
          for (const order of orders.values()) {
            if (
              order.status !== OrderStatus.RECEIVED &&
              order.status !== OrderStatus.WAITING_FOR_DISPATCH
            ) {
              throw ApiException.conflict(
                'ORDER_NOT_READY_FOR_DISPATCH',
                `Đơn ${order.trackingCode} không ở trạng thái chờ điều phối`,
              );
            }
          }
        }

        if (dto.status === TripStatus.IN_TRANSIT) {
          const manifest = await tx.manifest.findUnique({
            where: { tripId: trip.id },
            include: {
              items: { include: { package: { include: { order: true } } } },
            },
          });
          if (!manifest || manifest.items.length === 0) {
            throw ApiException.conflict('MANIFEST_REQUIRED', 'Không tìm thấy manifest của chuyến');
          }
          if (manifest.items.some((item) => item.status !== ManifestItemStatus.LOADED)) {
            throw ApiException.conflict('MANIFEST_NOT_READY', 'Tất cả kiện phải được xếp lên xe trước khi vận chuyển');
          }
          const orders = new Map(manifest.items.map((item) => [item.package.order.id, item.package.order]));
          for (const order of orders.values()) {
            if (
              order.status !== OrderStatus.WAITING_FOR_DISPATCH &&
              order.status !== OrderStatus.RECEIVED
            ) {
              throw ApiException.conflict(
                'ORDER_NOT_READY_FOR_DISPATCH',
                `Đơn ${order.trackingCode} không ở trạng thái chờ điều phối`,
              );
            }
          }
          for (const order of orders.values()) {
            const changed = await tx.order.update({
              where: { id: order.id },
              data: { status: OrderStatus.IN_TRANSIT, version: { increment: 1 } },
            });
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                changedById: user.id,
                fromStatus: order.status,
                toStatus: OrderStatus.IN_TRANSIT,
                reason: `Chuyến ${trip.code} đã bắt đầu vận chuyển`,
              },
            });
            orderEvents.push({
              id: order.id,
              trackingCode: order.trackingCode,
              fromStatus: order.status,
              toStatus: OrderStatus.IN_TRANSIT,
              version: changed.version,
            });
          }
        }

        if (dto.status === TripStatus.COMPLETED) {
          const manifest = await tx.manifest.findUnique({
            where: { tripId: trip.id },
            include: { items: true },
          });
          if (!manifest || manifest.items.length === 0) {
            throw ApiException.conflict(
              'MANIFEST_REQUIRED',
              'Không thể hoàn tất chuyến khi chưa có manifest',
            );
          }
          const unaccountedPackages = manifest.items.filter(
            (item) =>
              item.status === ManifestItemStatus.PENDING_LOAD ||
              item.status === ManifestItemStatus.LOADED,
          ).length;
          if (unaccountedPackages > 0) {
            throw ApiException.conflict(
              'MANIFEST_NOT_COMPLETED',
              'Vẫn còn kiện chưa được dỡ hoặc ghi nhận thiếu/hỏng',
            );
          }
          const unresolvedIncidents = await tx.incident.count({
            where: {
              tripId: trip.id,
              status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
          });
          if (unresolvedIncidents > 0) {
            throw ApiException.conflict(
              'TRIP_HAS_OPEN_INCIDENTS',
              'Cần xử lý hết sự cố đang mở trước khi hoàn tất chuyến',
            );
          }
        }

        const updatedTrip = await tx.trip.update({
          where: { id: trip.id },
          data: {
            status: dto.status,
            version: { increment: 1 },
            ...(dto.status === TripStatus.IN_TRANSIT ? { actualDepartureAt: now } : {}),
            ...(dto.status === TripStatus.ARRIVED ? { actualArrivalAt: now } : {}),
          },
        });

        await tx.tripStatusHistory.create({
          data: {
            tripId: trip.id,
            changedById: user.id,
            fromStatus: trip.status,
            toStatus: dto.status,
            note: dto.note,
          },
        });

        if (dto.status === TripStatus.DISPATCHED) {
          const [vehicle, driver, driverBusyTrips] = await Promise.all([
            tx.vehicle.findUnique({ where: { id: trip.vehicleId } }),
            tx.driver.findFirst({
              where: {
                id: trip.driverId,
                deletedAt: null,
                isActive: true,
                user: { deletedAt: null, status: 'ACTIVE', role: Role.DRIVER },
              },
            }),
            tx.trip.count({
              where: {
                id: { not: trip.id },
                driverId: trip.driverId,
                OR: [
                  { status: { in: [TripStatus.DISPATCHED, TripStatus.IN_TRANSIT, TripStatus.ARRIVED] } },
                  { status: TripStatus.BOARDING, plannedDepartureAt: { lte: now } },
                ],
              },
            }),
          ]);
          if (
            !vehicle ||
            vehicle.deletedAt ||
            !vehicle.isActive ||
            vehicle.status !== VehicleStatus.AVAILABLE
          ) {
            throw ApiException.conflict(
              'VEHICLE_UNAVAILABLE',
              'Xe không còn ở trạng thái sẵn sàng để xuất bến',
            );
          }
          if (!driver || driverBusyTrips > 0) {
            throw ApiException.conflict(
              'DRIVER_UNAVAILABLE',
              'Tài xế không còn hoạt động hoặc đang thực hiện chuyến xe khác',
            );
          }
          await tx.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: VehicleStatus.IN_USE },
          });
          if (manifestId) {
            await tx.manifest.update({
              where: { id: manifestId },
              data: { status: ManifestStatus.CLOSED, version: { increment: 1 } },
            });
          }
        }

        if (dto.status === TripStatus.COMPLETED || dto.status === TripStatus.CANCELLED) {
          const [otherActiveTrips, vehicle] = await Promise.all([
            tx.trip.count({
              where: {
                id: { not: trip.id },
                vehicleId: trip.vehicleId,
                status: {
                  in: [TripStatus.DISPATCHED, TripStatus.IN_TRANSIT, TripStatus.ARRIVED],
                },
              },
            }),
            tx.vehicle.findUnique({ where: { id: trip.vehicleId } }),
          ]);
          // Không ghi đè trạng thái MAINTENANCE do quản lý cập nhật trong lúc xe hoạt động.
          if (otherActiveTrips === 0 && vehicle?.status === VehicleStatus.IN_USE) {
            await tx.vehicle.update({
              where: { id: trip.vehicleId },
              data: { status: VehicleStatus.AVAILABLE },
            });
          }
          await tx.manifest.updateMany({
            where: { tripId: trip.id },
            data: { status: ManifestStatus.CLOSED, version: { increment: 1 } },
          });
        }

        return updatedTrip;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    this.realtime.emitToTrip(tripId, 'trip:status_changed', {
      tripId,
      status: updated.status,
      actorId: user.id,
      changedAt: new Date().toISOString(),
    }, updated.version);

    for (const order of orderEvents) {
      this.realtime.emitToOrder(order.id, 'order:status_changed', {
        orderId: order.id,
        trackingCode: order.trackingCode,
        fromStatus: order.fromStatus,
        toStatus: order.toStatus,
        actorId: user.id,
        reason: `Chuyến ${updated.code} đã xuất bến`,
      }, order.version);
    }

    return updated;
  }

  private async findTripOrThrow(id: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');
    return trip;
  }

  private async findDriverForUser(userId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { userId, deletedAt: null, isActive: true },
    });
    if (!driver) {
      throw ApiException.forbidden(
        'FORBIDDEN',
        'Tài khoản chưa có hồ sơ tài xế đang hoạt động',
      );
    }
    return driver;
  }

  private assertManagerOrAdmin(user: User) {
    if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ MANAGER hoặc ADMIN được tạo chuyến xe');
    }
  }

  private assertRoleCanReadTrips(user: User) {
    if (user.role === Role.STAFF) {
      throw ApiException.forbidden(
        'ASSIGNMENT_SCOPE_NOT_CONFIGURED',
        'Chưa có dữ liệu phân công nhân viên theo bến; tạm thời không thể giới hạn danh sách chuyến an toàn',
      );
    }
    if (user.role !== Role.DRIVER && user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn không có quyền xem chuyến xe');
    }
  }
}
