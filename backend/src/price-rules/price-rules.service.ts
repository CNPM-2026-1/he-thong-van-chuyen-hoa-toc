import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/api-exception';
import { OK_MESSAGE, omitMeta, paginated, skipTake } from '../common/utils';
import { RoutesService } from '../routes/routes.service';
import { ListPriceRulesQueryDto, PriceRuleInputDto, UpdatePriceRuleDto } from './dto/price-rule.dto';

@Injectable()
export class PriceRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly routes: RoutesService,
  ) {}

  async list(q: ListPriceRulesQueryDto) {
    const s = q.search?.trim();
    const where: Prisma.PriceRuleWhereInput = {
      deletedAt: null,
      routeId: q.routeId,
      isActive: q.isActive,
      // search theo mã/tên tuyến
      ...(s && {
        route: { OR: [{ code: { contains: s, mode: 'insensitive' } }, { name: { contains: s, mode: 'insensitive' } }] },
      }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.priceRule.findMany({ where, orderBy: [{ routeId: 'asc' }, { effectiveFrom: 'desc' }], ...skipTake(q) }),
      this.prisma.priceRule.count({ where }),
    ]);
    return paginated(items.map(omitMeta), q.page, total);
  }

  async get(id: string) {
    return omitMeta(await this.findOrThrow(id));
  }

  async create(dto: PriceRuleInputDto) {
    await this.routes.findOrThrow(dto.routeId);
    this.validatePeriod(dto.effectiveFrom, dto.effectiveTo);
    return omitMeta(await this.prisma.priceRule.create({ data: dto }));
  }

  async update(id: string, dto: UpdatePriceRuleDto) {
    const current = await this.findOrThrow(id);
    if (dto.routeId) await this.routes.findOrThrow(dto.routeId);
    this.validatePeriod(
      dto.effectiveFrom ?? current.effectiveFrom,
      dto.effectiveTo === undefined ? current.effectiveTo : dto.effectiveTo,
    );
    return omitMeta(await this.prisma.priceRule.update({ where: { id }, data: dto }));
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    await this.prisma.priceRule.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return OK_MESSAGE;
  }

  private async findOrThrow(id: string) {
    const row = await this.prisma.priceRule.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw ApiException.notFound('Không tìm thấy bảng giá');
    return row;
  }

  private validatePeriod(from: string | Date, to?: string | Date | null) {
    if (to && new Date(to) <= new Date(from)) {
      throw ApiException.badRequest('VALIDATION_ERROR', 'effectiveTo phải sau effectiveFrom');
    }
  }
}
