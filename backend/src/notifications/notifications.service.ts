import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma, Role, User } from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { paginated, skipTake } from '../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { ListNotificationsQueryDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async createForUser(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    orderId?: string;
    resourceType?: string;
    resourceId?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        orderId: input.orderId,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
      },
    });

    this.realtime.emitToUser(input.userId, 'notification:new', {
      notificationId: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      resourceType: notification.resourceType,
      resourceId: notification.resourceId,
      orderId: notification.orderId,
      createdAt: notification.createdAt,
    });
    return notification;
  }

  async notifyManagers(input: {
    type: NotificationType;
    title: string;
    body: string;
    resourceType?: string;
    resourceId?: string;
    orderId?: string;
  }) {
    const managers = await this.prisma.user.findMany({
      where: { role: { in: [Role.MANAGER, Role.ADMIN] }, status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    });
    for (const manager of managers) {
      await this.createForUser({ userId: manager.id, ...input });
    }
  }

  async list(query: ListNotificationsQueryDto, user: User) {
    const where: Prisma.NotificationWhereInput = {
      userId: user.id,
      ...(query.unreadOnly === 'true' ? { readAt: null } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...skipTake(query),
      }),
      this.prisma.notification.count({ where }),
    ]);
    return paginated(items, query.page, total);
  }

  async markRead(id: string, user: User) {
    const row = await this.prisma.notification.findFirst({
      where: { id, userId: user.id },
    });
    if (!row) throw ApiException.notFound('Không tìm thấy thông báo');
    if (row.readAt) return row;
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
}
