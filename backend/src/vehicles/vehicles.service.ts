import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/api-exception';
import { OK_MESSAGE, omitMeta, paginated, searchOr, skipTake } from '../common/utils';
import { ListVehiclesQueryDto, UpdateVehicleDto, VehicleInputDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListVehiclesQueryDto) {
    const where: Prisma.VehicleWhereInput = {
      deletedAt: null,
      vehicleType: q.vehicleType,
      status: q.status,
      isActive: q.isActive,
      ...searchOr(q.search, ['plateNumber']),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({ where, orderBy: { plateNumber: 'asc' }, ...skipTake(q) }),
      this.prisma.vehicle.count({ where }),
    ]);
    return paginated(items.map(omitMeta), q.page, total);
  }

  async get(id: string) {
    return omitMeta(await this.findOrThrow(id));
  }

  async create(dto: VehicleInputDto) {
    return omitMeta(await this.prisma.vehicle.create({ data: dto }));
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOrThrow(id);
    return omitMeta(await this.prisma.vehicle.update({ where: { id }, data: dto }));
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    await this.prisma.$transaction([
      this.prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } }),
      // Bỏ gán xe mặc định của tài xế đang dùng xe này
      this.prisma.driver.updateMany({ where: { defaultVehicleId: id }, data: { defaultVehicleId: null } }),
    ]);
    return OK_MESSAGE;
  }

  async findOrThrow(id: string) {
    const row = await this.prisma.vehicle.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw ApiException.notFound('Không tìm thấy xe');
    return row;
  }
}
