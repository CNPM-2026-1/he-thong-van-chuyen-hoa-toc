import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/api-exception';
import { OK_MESSAGE, omitMeta, paginated, searchOr, skipTake } from '../common/utils';
import { StationsService } from '../stations/stations.service';
import { ListRoutesQueryDto, RouteInputDto, UpdateRouteDto } from './dto/route.dto';

@Injectable()
export class RoutesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stations: StationsService,
  ) {}

  async list(q: ListRoutesQueryDto) {
    const where: Prisma.RouteWhereInput = {
      deletedAt: null,
      isActive: q.isActive,
      originStationId: q.originStationId,
      destinationStationId: q.destinationStationId,
      ...searchOr(q.search, ['code', 'name']),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.route.findMany({ where, orderBy: { code: 'asc' }, ...skipTake(q) }),
      this.prisma.route.count({ where }),
    ]);
    return paginated(items.map(omitMeta), q.page, total);
  }

  async get(id: string) {
    return omitMeta(await this.findOrThrow(id));
  }

  async create(dto: RouteInputDto) {
    await this.validateStations(dto.originStationId, dto.destinationStationId);
    return omitMeta(await this.prisma.route.create({ data: dto }));
  }

  async update(id: string, dto: UpdateRouteDto) {
    const current = await this.findOrThrow(id);
    if (dto.originStationId || dto.destinationStationId) {
      await this.validateStations(
        dto.originStationId ?? current.originStationId,
        dto.destinationStationId ?? current.destinationStationId,
      );
    }
    return omitMeta(await this.prisma.route.update({ where: { id }, data: dto }));
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    await this.prisma.route.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return OK_MESSAGE;
  }

  async findOrThrow(id: string) {
    const row = await this.prisma.route.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw ApiException.notFound('Không tìm thấy tuyến');
    return row;
  }

  private async validateStations(originId: string, destinationId: string) {
    if (originId === destinationId) {
      throw ApiException.badRequest('VALIDATION_ERROR', 'Bến đi và bến đến phải khác nhau');
    }
    await this.stations.findOrThrow(originId);
    await this.stations.findOrThrow(destinationId);
  }
}
