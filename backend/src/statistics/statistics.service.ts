import { Injectable } from '@nestjs/common';
import { IncidentStatus, OrderStatus, Role, User } from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { PrismaService } from '../prisma/prisma.service';
import { DateRangeQueryDto } from './dto/statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(query: DateRangeQueryDto, user: User) {
    this.assertManagerOrAdmin(user);
    const range = this.toRange(query);

    const [
      totalOrders,
      ordersInTransit,
      deliveredOrders,
      returnedOrders,
      cod,
      openIncidents,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: range } }),
      this.prisma.order.count({
        where: {
          createdAt: range,
          status: { in: [OrderStatus.IN_TRANSIT, OrderStatus.AT_DESTINATION, OrderStatus.OUT_FOR_DELIVERY] },
        },
      }),
      this.prisma.order.count({ where: { deliveredAt: range } }),
      this.prisma.order.count({ where: { returnedAt: range } }),
      this.prisma.codTransaction.aggregate({
        where: { collectedAt: range },
        _sum: { amountVnd: true },
      }),
      this.prisma.incident.count({
        where: {
          createdAt: range,
          status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] },
        },
      }),
    ]);

    return {
      from: query.from,
      to: query.to,
      totalOrders,
      ordersInTransit,
      deliveredOrders,
      returnedOrders,
      totalCodVnd: cod._sum.amountVnd ?? 0,
      openIncidents,
    };
  }

  async orders(query: DateRangeQueryDto, user: User) {
    this.assertManagerOrAdmin(user);
    const range = this.toRange(query);
    const [statusGroups, serviceGroups] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: range },
        _count: { _all: true },
      }),
      this.prisma.order.groupBy({
        by: ['serviceLevel'],
        where: { createdAt: range },
        _count: { _all: true },
      }),
    ]);

    return {
      from: query.from,
      to: query.to,
      byStatus: Object.fromEntries(statusGroups.map((item) => [item.status, item._count._all])),
      byServiceLevel: Object.fromEntries(serviceGroups.map((item) => [item.serviceLevel, item._count._all])),
    };
  }

  async cod(query: DateRangeQueryDto, user: User) {
    this.assertManagerOrAdmin(user);
    const range = this.toRange(query);
    const [collected, reconciled, pending] = await Promise.all([
      this.prisma.codTransaction.aggregate({
        where: { collectedAt: range },
        _sum: { amountVnd: true },
      }),
      this.prisma.codTransaction.aggregate({
        where: { collectedAt: range, status: 'RECONCILED' },
        _sum: { amountVnd: true },
      }),
      this.prisma.codTransaction.aggregate({
        where: { collectedAt: range, status: 'PENDING_REMITTANCE' },
        _sum: { amountVnd: true },
      }),
    ]);

    return {
      from: query.from,
      to: query.to,
      collectedVnd: collected._sum.amountVnd ?? 0,
      reconciledVnd: reconciled._sum.amountVnd ?? 0,
      pendingVnd: pending._sum.amountVnd ?? 0,
    };
  }

  private toRange(query: DateRangeQueryDto) {
    const from = new Date(`${query.from}T00:00:00.000Z`);
    const to = new Date(`${query.to}T00:00:00.000Z`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      throw ApiException.badRequest('VALIDATION_ERROR', 'Khoảng from/to không hợp lệ');
    }
    to.setUTCDate(to.getUTCDate() + 1);
    return { gte: from, lt: to };
  }

  private assertManagerOrAdmin(user: User) {
    if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ MANAGER hoặc ADMIN được xem thống kê');
    }
  }
}
