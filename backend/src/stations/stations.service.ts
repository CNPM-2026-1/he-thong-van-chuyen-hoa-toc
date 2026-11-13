import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/api-exception';
import { OK_MESSAGE, omitMeta, paginated, searchOr, skipTake } from '../common/utils';
import { ListStationsQueryDto, StationInputDto, UpdateStationDto } from './dto/station.dto';

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListStationsQueryDto) {
    const where: Prisma.StationWhereInput = {
      deletedAt: null,
      type: q.type,
      isActive: q.isActive,
      province: q.province ? { contains: q.province, mode: 'insensitive' } : undefined,
      ...searchOr(q.search, ['code', 'name', 'address', 'province']),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.station.findMany({ where, orderBy: { code: 'asc' }, ...skipTake(q) }),
      this.prisma.station.count({ where }),
    ]);
    return paginated(items.map(omitMeta), q.page, total);
  }

  async get(id: string) {
    return omitMeta(await this.findOrThrow(id));
  }

  async create(dto: StationInputDto) {
    return omitMeta(await this.prisma.station.create({ data: dto }));
  }

  async update(id: string, dto: UpdateStationDto) {
    await this.findOrThrow(id);
    return omitMeta(await this.prisma.station.update({ where: { id }, data: dto }));
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    const activeRoutes = await this.prisma.route.count({
      where: { deletedAt: null, OR: [{ originStationId: id }, { destinationStationId: id }] },
    });
    if (activeRoutes) {
      throw ApiException.conflict('STATION_IN_USE', `Bến đang được dùng bởi ${activeRoutes} tuyến, hãy xóa hoặc sửa tuyến trước`);
    }
    await this.prisma.station.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return OK_MESSAGE;
  }

  async findOrThrow(id: string) {
    const row = await this.prisma.station.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw ApiException.notFound('Không tìm thấy bến/văn phòng');
    return row;
  }
}
