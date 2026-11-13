import { Injectable } from '@nestjs/common';
import { Driver, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/api-exception';
import { OK_MESSAGE, paginated, skipTake } from '../common/utils';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DriverInputDto, ListDriversQueryDto, UpdateDriverDto } from './dto/driver.dto';

type DriverWithUser = Driver & { user: User };

function toDriverResponse(d: DriverWithUser) {
  return {
    id: d.id,
    userId: d.userId,
    fullName: d.user.fullName,
    phone: d.user.phone,
    licenseNumber: d.licenseNumber,
    defaultVehicleId: d.defaultVehicleId,
    isActive: d.isActive,
  };
}

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehicles: VehiclesService,
  ) {}

  async list(q: ListDriversQueryDto) {
    const s = q.search?.trim();
    const where: Prisma.DriverWhereInput = {
      deletedAt: null,
      isActive: q.isActive,
      ...(s && {
        OR: [
          { licenseNumber: { contains: s, mode: 'insensitive' } },
          { user: { fullName: { contains: s, mode: 'insensitive' } } },
          { user: { phone: { contains: s } } },
        ],
      }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany({ where, include: { user: true }, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.driver.count({ where }),
    ]);
    return paginated(items.map(toDriverResponse), q.page, total);
  }

  async get(id: string) {
    return toDriverResponse(await this.findOrThrow(id));
  }

  async create(dto: DriverInputDto) {
    const user = await this.prisma.user.findFirst({ where: { id: dto.userId, deletedAt: null } });
    if (!user) throw ApiException.notFound('Không tìm thấy tài khoản');
    if (user.role !== 'DRIVER') {
      throw ApiException.badRequest('VALIDATION_ERROR', 'Tài khoản phải có vai trò DRIVER');
    }
    if (dto.defaultVehicleId) await this.vehicles.findOrThrow(dto.defaultVehicleId);

    // Hồ sơ cũ đã xóa mềm của cùng tài khoản -> khôi phục thay vì báo trùng
    const existing = await this.prisma.driver.findUnique({ where: { userId: dto.userId } });
    if (existing && !existing.deletedAt) {
      throw ApiException.conflict('DUPLICATE', 'Tài khoản này đã có hồ sơ tài xế');
    }
    const data = { ...dto, isActive: dto.isActive ?? true, deletedAt: null };
    const driver = existing
      ? await this.prisma.driver.update({ where: { id: existing.id }, data, include: { user: true } })
      : await this.prisma.driver.create({ data, include: { user: true } });
    return toDriverResponse(driver);
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.findOrThrow(id);
    if (dto.defaultVehicleId) await this.vehicles.findOrThrow(dto.defaultVehicleId);
    const driver = await this.prisma.driver.update({ where: { id }, data: dto, include: { user: true } });
    return toDriverResponse(driver);
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    await this.prisma.driver.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return OK_MESSAGE;
  }

  private async findOrThrow(id: string) {
    const row = await this.prisma.driver.findFirst({ where: { id, deletedAt: null }, include: { user: true } });
    if (!row) throw ApiException.notFound('Không tìm thấy tài xế');
    return row;
  }
}
