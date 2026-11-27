import { Injectable } from '@nestjs/common';
import { Role, TripStatus, User } from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripLocationDto } from './dto/trip-location.dto';

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async createLocation(tripId: string, dto: CreateTripLocationDto, user: User) {
    if (user.role !== Role.DRIVER) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ tài xế được gửi vị trí GPS');
    }

    const driver = await this.prisma.driver.findFirst({
      where: { userId: user.id, deletedAt: null, isActive: true },
    });
    if (!driver) {
      throw ApiException.forbidden('FORBIDDEN', 'Tài khoản chưa có hồ sơ tài xế đang hoạt động');
    }

    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');
    if (trip.driverId !== driver.id) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn chỉ được gửi GPS cho chuyến xe được phân công');
    }
    if (trip.status !== TripStatus.IN_TRANSIT) {
      throw ApiException.conflict('TRIP_NOT_IN_TRANSIT', 'Chỉ được gửi GPS khi chuyến xe đang vận chuyển');
    }

    const recordedAt = new Date(dto.recordedAt);
    const latestAllowedTime = Date.now() + 2 * 60 * 1000;
    if (recordedAt.getTime() > latestAllowedTime) {
      throw ApiException.badRequest('VALIDATION_ERROR', 'recordedAt không được nằm quá 2 phút trong tương lai');
    }

    const location = await this.prisma.tripLocation.create({
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
    });

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
      throw ApiException.forbidden(
        'ORDER_TRIP_SCOPE_NOT_CONFIGURED',
        'Chưa có quan hệ đơn hàng - chuyến xe để xác minh khách hàng có quyền theo dõi chuyến này',
      );
    }

    if (user.role === Role.DRIVER) {
      const driver = await this.prisma.driver.findFirst({
        where: { userId: user.id, deletedAt: null, isActive: true },
      });
      if (!driver || trip.driverId !== driver.id) {
        throw ApiException.forbidden('FORBIDDEN', 'Bạn chỉ được xem vị trí chuyến xe được phân công');
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
