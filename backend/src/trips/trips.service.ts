import { Injectable } from '@nestjs/common';
import { Prisma, Role, TripStatus, User, VehicleStatus } from '@prisma/client';
import { ApiException } from '../common/api-exception';
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
  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateTripDto, user: User) {
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
      return await this.prisma.$transaction(
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
          if (!driver || driver.user.deletedAt || driver.user.status !== 'ACTIVE' || driver.user.role !== Role.DRIVER) {
            throw ApiException.badRequest('VALIDATION_ERROR', 'Tài xế không tồn tại hoặc không còn hoạt động');
          }
          if (vehicle.status !== VehicleStatus.AVAILABLE) {
            throw ApiException.conflict('VEHICLE_UNAVAILABLE', 'Xe không ở trạng thái sẵn sàng');
          }

          const estimatedArrival = arrival ?? new Date(
            departure.getTime() + route.estimatedDurationMinutes * 60 * 1000,
          );
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
              'Xe hoặc tài xế đang được phân công vào một chuyến chưa kết thúc',
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
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw ApiException.conflict('DUPLICATE', 'Mã chuyến xe đã tồn tại');
        }
        if (error.code === 'P2034') {
          throw ApiException.conflict(
            'TRIP_ASSIGNMENT_CONFLICT',
            'Dữ liệu phân công vừa thay đổi; vui lòng tải lại và thử lại',
          );
        }
      }
      throw error;
    }
  }

  async updateStatus(tripId: string, dto: UpdateTripStatusDto, user: User) {
    if (![Role.DRIVER, Role.MANAGER, Role.ADMIN].includes(user.role)) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn không có quyền cập nhật trạng thái chuyến');
    }

    return this.prisma.$transaction(
      async (tx) => {
        const trip = await tx.trip.findUnique({ where: { id: tripId } });
        if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');

        if (user.role === Role.DRIVER) {
          const driver = await tx.driver.findFirst({
            where: { userId: user.id, deletedAt: null, isActive: true },
          });
          if (!driver || trip.driverId !== driver.id) {
            throw ApiException.forbidden('FORBIDDEN', 'Bạn chỉ được cập nhật chuyến xe được phân công');
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
        const updated = await tx.trip.update({
          where: { id: trip.id },
          data: {
            status: dto.status,
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
          await tx.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: VehicleStatus.IN_USE },
          });
        }

        if (dto.status === TripStatus.COMPLETED || dto.status === TripStatus.CANCELLED) {
          const otherActiveTrips = await tx.trip.count({
            where: {
              id: { not: trip.id },
              vehicleId: trip.vehicleId,
              status: { in: ACTIVE_TRIP_STATUSES },
            },
          });
          if (otherActiveTrips === 0) {
            await tx.vehicle.update({
              where: { id: trip.vehicleId },
              data: { status: VehicleStatus.AVAILABLE },
            });
          }
        }

        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
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
      throw ApiException.forbidden('FORBIDDEN', 'Tài khoản chưa có hồ sơ tài xế đang hoạt động');
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
    if (![Role.DRIVER, Role.MANAGER, Role.ADMIN].includes(user.role)) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn không có quyền xem chuyến xe');
    }
  }
}
