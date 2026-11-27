import { Injectable } from '@nestjs/common';
import { OrderStatus, Role, TripStatus, User } from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { IdempotencyService } from '../common/idempotency.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripLocationDto } from './dto/trip-location.dto';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async createLocation(
    tripId: string,
    dto: CreateTripLocationDto,
    user: User,
    idempotencyKey: string | undefined,
  ) {
    if (user.role !== Role.DRIVER) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ tài xế được gửi vị trí GPS');
    }

    const result = await this.idempotency.execute(
      user.id,
      `POST:/trips/${tripId}/locations`,
      idempotencyKey,
      { tripId, ...dto },
      async (tx) => {
        const driver = await tx.driver.findFirst({
          where: { userId: user.id, deletedAt: null, isActive: true },
        });
        if (!driver) {
          throw ApiException.forbidden(
            'FORBIDDEN',
            'Tài khoản chưa có hồ sơ tài xế đang hoạt động',
          );
        }

        const trip = await tx.trip.findUnique({ where: { id: tripId } });
        if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');
        if (trip.driverId !== driver.id) {
          throw ApiException.forbidden(
            'FORBIDDEN',
            'Bạn chỉ được gửi GPS cho chuyến xe được phân công',
          );
        }
        if (trip.status !== TripStatus.IN_TRANSIT) {
          throw ApiException.conflict(
            'TRIP_NOT_IN_TRANSIT',
            'Chỉ được gửi GPS khi chuyến xe đang vận chuyển',
          );
        }

        const recordedAt = new Date(dto.recordedAt);
        if (recordedAt.getTime() > Date.now() + 2 * 60 * 1000) {
          throw ApiException.badRequest(
            'VALIDATION_ERROR',
            'recordedAt không được nằm quá 2 phút trong tương lai',
          );
        }

        const [location, updatedTrip] = await Promise.all([
          tx.tripLocation.create({
            data: {
              tripId: trip.id,
              vehicleId: trip.vehicleId,
              driverId: driver.id,
              latitude: dto.latitude,
              longitude: dto.longitude,
              speedKph: dto.speedKph,
              headingDegrees: dto.headingDegrees,
              recordedAt,
            },
          }),
          tx.trip.update({
            where: { id: trip.id },
            data: { version: { increment: 1 } },
          }),
        ]);

        return {
          tripId: location.tripId,
          vehicleId: location.vehicleId,
          driverId: location.driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          speedKph: location.speedKph,
          headingDegrees: location.headingDegrees,
          recordedAt: location.recordedAt,
          resourceVersion: updatedTrip.version,
        };
      },
    );

    this.realtime.emitToTrip(tripId, 'trip:location_updated', {
      tripId: result.tripId,
      vehicleId: result.vehicleId,
      driverId: result.driverId,
      latitude: result.latitude,
      longitude: result.longitude,
      speedKph: result.speedKph,
      headingDegrees: result.headingDegrees,
      recordedAt: result.recordedAt,
    }, result.resourceVersion);

    return {
      tripId: result.tripId,
      vehicleId: result.vehicleId,
      driverId: result.driverId,
      latitude: result.latitude,
      longitude: result.longitude,
      speedKph: result.speedKph,
      headingDegrees: result.headingDegrees,
      recordedAt: result.recordedAt,
    };
  }

  async getLatestLocation(tripId: string, user: User) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');

    if (user.role === Role.STAFF) {
      throw ApiException.forbidden(
        'ASSIGNMENT_SCOPE_NOT_CONFIGURED',
        'Chưa có dữ liệu phân công nhân viên theo bến để kiểm tra quyền xem vị trí',
      );
    }

    if (user.role === Role.CUSTOMER) {
      const linkedOrder = await this.prisma.manifestItem.findFirst({
        where: {
          manifest: { is: { tripId } },
          package: {
            is: {
              order: { is: { customerId: user.id, status: OrderStatus.IN_TRANSIT } },
            },
          },
        },
        select: { id: true },
      });
      if (!linkedOrder) {
        throw ApiException.forbidden(
          'FORBIDDEN',
          'Bạn không có đơn hàng đang vận chuyển trên chuyến này',
        );
      }
    } else if (user.role === Role.DRIVER) {
      const driver = await this.prisma.driver.findFirst({
        where: { userId: user.id, deletedAt: null, isActive: true },
      });
      if (!driver || trip.driverId !== driver.id) {
        throw ApiException.forbidden(
          'FORBIDDEN',
          'Bạn chỉ được xem vị trí chuyến xe được phân công',
        );
      }
    } else if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn không có quyền xem vị trí chuyến xe');
    }

    const location = await this.prisma.tripLocation.findFirst({
      where: { tripId: trip.id },
      orderBy: [{ recordedAt: 'desc' }, { createdAt: 'desc' }],
    });
    if (!location) throw ApiException.notFound('Chuyến xe chưa có dữ liệu GPS');

    return {
      tripId: location.tripId,
      vehicleId: location.vehicleId,
      driverId: location.driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      speedKph: location.speedKph,
      headingDegrees: location.headingDegrees,
      recordedAt: location.recordedAt,
    };
  }
}
