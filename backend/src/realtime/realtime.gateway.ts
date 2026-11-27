import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Role, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

type RoomResource = 'user' | 'order' | 'trip' | 'station';
type RoomJoinPayload = { resourceType: RoomResource; resourceId: string };
type Ack = { ok: true } | { ok: false; error: { code: string; message: string } };

@WebSocketGateway({
  namespace: '/',
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (typeof token !== 'string' || !token.trim()) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwt.verifyAsync<{ sub: string; type?: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      if (payload.type !== 'access' || !payload.sub) {
        client.disconnect(true);
        return;
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.deletedAt || user.status !== 'ACTIVE') {
        client.disconnect(true);
        return;
      }

      client.data.user = user;
      await client.join(this.userRoom(user.id));
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {
    // Socket.IO automatically removes disconnected sockets from all rooms.
  }

  @SubscribeMessage('room:join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomJoinPayload,
  ): Promise<Ack> {
    const user = client.data.user as User | undefined;
    if (!user) return this.fail('UNAUTHENTICATED', 'Socket chưa được xác thực');

    if (
      !payload ||
      !['user', 'order', 'trip', 'station'].includes(payload.resourceType) ||
      typeof payload.resourceId !== 'string'
    ) {
      return this.fail('VALIDATION_ERROR', 'resourceType hoặc resourceId không hợp lệ');
    }

    try {
      const allowed = await this.canJoinRoom(user, payload);
      if (!allowed) return this.fail('FORBIDDEN', 'Bạn không có quyền tham gia room này');
      await client.join(this.roomName(payload));
      return { ok: true };
    } catch (error) {
      this.logger.warn(`Room join rejected: ${String(error)}`);
      return this.fail('FORBIDDEN', 'Không thể xác minh quyền tham gia room');
    }
  }

  @SubscribeMessage('room:leave')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomJoinPayload,
  ): Promise<Ack> {
    const user = client.data.user as User | undefined;
    if (!user) return this.fail('UNAUTHENTICATED', 'Socket chưa được xác thực');
    if (
      !payload ||
      !['user', 'order', 'trip', 'station'].includes(payload.resourceType) ||
      typeof payload.resourceId !== 'string'
    ) {
      return this.fail('VALIDATION_ERROR', 'resourceType hoặc resourceId không hợp lệ');
    }
    if (payload.resourceType === 'user' && payload.resourceId !== user.id) {
      return this.fail('FORBIDDEN', 'Không thể rời room của người dùng khác');
    }
    await client.leave(this.roomName(payload));
    return { ok: true };
  }

  @SubscribeMessage('ping:client')
  ping(@MessageBody() payload: { sentAt?: string }) {
    return { event: 'pong:server', data: { sentAt: payload?.sentAt, serverTime: new Date().toISOString() } };
  }

  emitToTrip(tripId: string, event: string, data: Record<string, unknown>, resourceVersion = 1) {
    this.emitToRoom(`trip:${tripId}`, event, data, resourceVersion);
  }

  emitToOrder(orderId: string, event: string, data: Record<string, unknown>, resourceVersion = 1) {
    this.emitToRoom(`order:${orderId}`, event, data, resourceVersion);
  }

  emitToUser(userId: string, event: string, data: Record<string, unknown>) {
    this.emitToRoom(this.userRoom(userId), event, data, 1);
  }

  private emitToRoom(
    room: string,
    event: string,
    data: Record<string, unknown>,
    resourceVersion: number,
  ) {
    if (!this.server) return;
    this.server.to(room).emit(event, {
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      resourceVersion,
      data,
    });
  }

  private async canJoinRoom(user: User, payload: RoomJoinPayload): Promise<boolean> {
    if (payload.resourceType === 'user') {
      return payload.resourceId === user.id ||
        (user.role === Role.ADMIN && payload.resourceId === user.id);
    }

    if (payload.resourceType === 'station') {
      // The database has no staff-to-station assignment table yet.
      return user.role === Role.MANAGER || user.role === Role.ADMIN;
    }

    if (payload.resourceType === 'trip') {
      const trip = await this.prisma.trip.findUnique({ where: { id: payload.resourceId } });
      if (!trip) return false;
      if (user.role === Role.MANAGER || user.role === Role.ADMIN) return true;

      if (user.role === Role.DRIVER) {
        const driver = await this.prisma.driver.findFirst({
          where: { userId: user.id, isActive: true, deletedAt: null },
        });
        return !!driver && trip.driverId === driver.id;
      }

      if (user.role === Role.CUSTOMER) {
        const linkedOrder = await this.prisma.manifestItem.findFirst({
          where: {
            manifest: { tripId: trip.id },
            package: { order: { customerId: user.id, status: 'IN_TRANSIT' } },
          },
          select: { id: true },
        });
        return !!linkedOrder;
      }
      return false;
    }

    const order = await this.prisma.order.findUnique({ where: { id: payload.resourceId } });
    if (!order) return false;
    if (user.role === Role.MANAGER || user.role === Role.ADMIN) return true;
    if (user.role === Role.CUSTOMER) return order.customerId === user.id;

    if (user.role === Role.DRIVER) {
      const driver = await this.prisma.driver.findFirst({
        where: { userId: user.id, isActive: true, deletedAt: null },
      });
      if (!driver) return false;
      const assignedItem = await this.prisma.manifestItem.findFirst({
        where: {
          package: { orderId: order.id },
          manifest: { trip: { driverId: driver.id } },
        },
        select: { id: true },
      });
      return !!assignedItem;
    }
    // STAFF is denied until station assignment is represented in the schema.
    return false;
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private roomName(payload: RoomJoinPayload) {
    return payload.resourceType === 'user'
      ? this.userRoom(payload.resourceId)
      : `${payload.resourceType}:${payload.resourceId}`;
  }

  private fail(code: string, message: string): Ack {
    return { ok: false, error: { code, message } };
  }
}
