import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CodTransactionStatus,
  DeliveryAttemptStatus,
  IncidentStatus,
  MediaPurpose,
  NotificationType,
  OrderStatus,
  Prisma,
  Role,
  TripStatus,
  User,
} from '@prisma/client';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'crypto';
import { ApiException } from '../common/api-exception';
import { IdempotencyService } from '../common/idempotency.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryConfirmDto, DeliveryFailedDto, StartReturnDto } from './dto/delivery.dto';
import { SmsService } from './sms.service';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly config: ConfigService,
    private readonly sms: SmsService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async startDelivery(
    orderId: string,
    user: User,
    key: string | undefined,
  ) {
    this.assertDriver(user);
    const result = await this.idempotency.execute(
      user.id,
      `POST:/orders/${orderId}/delivery/start`,
      key,
      { orderId },
      async (tx) => {
        const { order, driver, trip } = await this.getAssignedOrderContext(tx, orderId, user.id);
        if (order.status !== OrderStatus.AT_DESTINATION) {
          throw ApiException.conflict(
            'ORDER_NOT_AT_DESTINATION',
            'Chỉ bắt đầu giao khi đơn đã đến bến đích',
          );
        }
        if (trip.status !== TripStatus.ARRIVED) {
          throw ApiException.conflict('TRIP_NOT_ARRIVED', 'Chuyến xe chưa đến bến đích');
        }

        const manifest = await tx.manifest.findUnique({
          where: { tripId: trip.id },
          include: { items: { include: { package: true } } },
        });
        const orderItems = manifest?.items.filter((item) => item.package.orderId === order.id) ?? [];
        if (
          orderItems.length !== order.packageCount ||
          orderItems.some((item) => item.status !== 'UNLOADED')
        ) {
          throw ApiException.conflict(
            'PACKAGES_NOT_UNLOADED',
            'Tất cả kiện của đơn phải được xác nhận dỡ tại bến đích trước khi giao',
          );
        }

        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.OUT_FOR_DELIVERY, version: { increment: 1 } },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            changedById: user.id,
            fromStatus: OrderStatus.AT_DESTINATION,
            toStatus: OrderStatus.OUT_FOR_DELIVERY,
            reason: 'Tài xế bắt đầu giao hàng',
          },
        });
        const notification = await tx.notification.create({
          data: {
            userId: order.customerId,
            orderId: order.id,
            type: NotificationType.DELIVERY,
            title: 'Đơn hàng đang được giao',
            body: `Đơn ${order.trackingCode} đang được tài xế giao đến người nhận`,
            resourceType: 'order',
            resourceId: order.id,
          },
        });
        return { order: updatedOrder, notification, driverId: driver.id, tripId: trip.id };
      },
    );

    this.emitNotificationIfNew(result.notification);
    this.realtime.emitToOrder(orderId, 'order:status_changed', {
      orderId,
      trackingCode: result.order.trackingCode,
      fromStatus: OrderStatus.AT_DESTINATION,
      toStatus: OrderStatus.OUT_FOR_DELIVERY,
      actorId: user.id,
    }, result.order.version);
    return this.toOrderResponse(result.order);
  }

  async requestDeliveryOtp(
    orderId: string,
    user: User,
    key: string | undefined,
  ) {
    this.assertDriver(user);
    if (!key) {
      throw ApiException.badRequest('VALIDATION_ERROR', 'Header Idempotency-Key là bắt buộc');
    }
    const otpKey = createHash('sha256')
      .update(`${user.id}|POST:/orders/${orderId}/delivery/otp|${key}`)
      .digest('hex');

    const result = await this.idempotency.execute(
      user.id,
      `POST:/orders/${orderId}/delivery/otp`,
      key,
      { orderId },
      async (tx) => {
        const { order, driver, trip } = await this.getAssignedOrderContext(tx, orderId, user.id);
        if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
          throw ApiException.conflict('ORDER_NOT_OUT_FOR_DELIVERY', 'Đơn chưa ở trạng thái đang giao');
        }
        if (trip.status !== TripStatus.ARRIVED) {
          throw ApiException.conflict('TRIP_NOT_AT_DESTINATION', 'Chuyến xe chưa đến bến đích');
        }

        const now = new Date();
        const code = randomInt(100000, 1000000).toString();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
        const codeHash = createHmac(
          'sha256',
          this.config.getOrThrow<string>('OTP_HASH_SECRET'),
        ).update(`${order.id}:${code}`).digest('hex');

        await tx.deliveryOtp.updateMany({
          where: { orderId: order.id, consumedAt: null, expiresAt: { gt: now } },
          data: { consumedAt: now },
        });
        await tx.deliveryOtp.create({
          data: {
            orderId: order.id,
            driverId: driver.id,
            requestedById: user.id,
            codeHash,
            codeCiphertext: this.encryptOtp(code),
            idempotencyKey: otpKey,
            expiresAt,
            sentAt: now,
          },
        });

        return {
          message: 'OTP sent to recipient',
          sentAt: now,
          expiresAt,
        };
      },
    );

    const otp = await this.prisma.deliveryOtp.findUnique({ where: { idempotencyKey: otpKey } });
    if (!otp) throw ApiException.serviceUnavailable('OTP_RECORD_MISSING', 'Không tìm thấy bản ghi OTP');
    const code = this.decryptOtp(otp.codeCiphertext);
    await this.sms.send(
      (await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } })).recipientPhone,
      `Ma OTP giao hang cua ban la ${code}. Ma co hieu luc trong 5 phut. Khong chia se ma nay voi nguoi khac.`,
    );

    return result;
  }

  async confirmDelivery(
    orderId: string,
    dto: DeliveryConfirmDto,
    user: User,
    key: string | undefined,
  ) {
    this.assertDriver(user);
    const result = await this.idempotency.execute(
      user.id,
      `POST:/orders/${orderId}/delivery/confirm`,
      key,
      { orderId, ...dto },
      async (tx) => {
        const { order, driver, trip } = await this.getAssignedOrderContext(tx, orderId, user.id);
        if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
          throw ApiException.conflict('ORDER_NOT_OUT_FOR_DELIVERY', 'Đơn không ở trạng thái đang giao');
        }

        const otp = await tx.deliveryOtp.findFirst({
          where: {
            orderId: order.id,
            driverId: driver.id,
            consumedAt: null,
          },
          orderBy: { createdAt: 'desc' },
        });
        if (!otp || otp.expiresAt <= new Date() || otp.attempts >= 5) {
          return { otpError: 'EXPIRED_OR_NOT_FOUND' as const };
        }

        const expectedHash = createHmac(
          'sha256',
          this.config.getOrThrow<string>('OTP_HASH_SECRET'),
        ).update(`${order.id}:${dto.otp}`).digest();
        const savedHash = Buffer.from(otp.codeHash, 'hex');
        const valid = expectedHash.length === savedHash.length && timingSafeEqual(expectedHash, savedHash);
        if (!valid) {
          await tx.deliveryOtp.update({
            where: { id: otp.id },
            data: { attempts: { increment: 1 } },
          });
          return { otpError: 'INVALID' as const };
        }

        const codCollected = dto.codCollectedVnd ?? 0;
        if (codCollected !== order.codAmountVnd) {
          throw ApiException.conflict(
            'COD_AMOUNT_MISMATCH',
            'Số tiền COD thu được phải khớp số tiền COD của đơn hàng',
          );
        }

        const photoObjectKeys = dto.photoObjectKeys ?? [];
        if (photoObjectKeys.length > 0) {
          const media = await tx.mediaObject.findMany({
            where: {
              objectKey: { in: photoObjectKeys },
              uploadedById: user.id,
              purpose: MediaPurpose.DELIVERY_PROOF,
            },
            select: { objectKey: true },
          });
          if (media.length !== new Set(photoObjectKeys).size) {
            throw ApiException.badRequest(
              'VALIDATION_ERROR',
              'Một hoặc nhiều objectKey không phải ảnh chứng minh được cấp cho tài khoản hiện tại',
            );
          }
        }

        const now = new Date();
        await tx.deliveryOtp.update({
          where: { id: otp.id },
          data: { consumedAt: now },
        });
        const attempt = await tx.deliveryAttempt.create({
          data: {
            orderId: order.id,
            driverId: driver.id,
            actorId: user.id,
            status: DeliveryAttemptStatus.DELIVERED,
            recipientName: dto.recipientName ?? order.recipientName,
            codCollectedVnd: codCollected,
            note: dto.note,
            photoObjectKeys: photoObjectKeys as Prisma.InputJsonValue,
            deliveredAt: now,
          },
        });
        if (codCollected > 0) {
          await tx.codTransaction.create({
            data: {
              orderId: order.id,
              tripId: trip.id,
              driverId: driver.id,
              amountVnd: codCollected,
              status: CodTransactionStatus.PENDING_REMITTANCE,
              collectedAt: now,
            },
          });
        }

        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.DELIVERED,
            deliveredAt: now,
            version: { increment: 1 },
          },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            changedById: user.id,
            fromStatus: OrderStatus.OUT_FOR_DELIVERY,
            toStatus: OrderStatus.DELIVERED,
            reason: 'Xác nhận OTP giao hàng thành công',
          },
        });
        const notification = await tx.notification.create({
          data: {
            userId: order.customerId,
            orderId: order.id,
            type: NotificationType.DELIVERY,
            title: 'Giao hàng thành công',
            body: `Đơn ${order.trackingCode} đã được giao thành công`,
            resourceType: 'order',
            resourceId: order.id,
          },
        });

        return {
          id: attempt.id,
          orderId: order.id,
          driverId: driver.id,
          status: attempt.status,
          recipientName: attempt.recipientName,
          deliveredAt: attempt.deliveredAt,
          codCollectedVnd: attempt.codCollectedVnd,
          photoObjectKeys,
          orderVersion: updatedOrder.version,
          trackingCode: order.trackingCode,
          notification,
        };
      },
    );

    if ('otpError' in result) {
      const message = result.otpError === 'INVALID'
        ? 'OTP không chính xác'
        : 'OTP đã hết hạn, đã sử dụng hoặc không tồn tại';
      throw ApiException.badRequest('INVALID_OTP', message);
    }

    this.emitNotificationIfNew(result.notification);
    this.realtime.emitToOrder(orderId, 'delivery:completed', {
      orderId,
      trackingCode: result.trackingCode,
      deliveredAt: result.deliveredAt,
      recipientName: result.recipientName,
      codCollectedVnd: result.codCollectedVnd ?? 0,
    }, result.orderVersion);
    this.realtime.emitToOrder(orderId, 'order:status_changed', {
      orderId,
      trackingCode: result.trackingCode,
      fromStatus: OrderStatus.OUT_FOR_DELIVERY,
      toStatus: OrderStatus.DELIVERED,
      actorId: user.id,
    }, result.orderVersion);

    const { orderVersion, trackingCode, notification, ...response } = result;
    return response;
  }

  async recordDeliveryFailure(
    orderId: string,
    dto: DeliveryFailedDto,
    user: User,
    key: string | undefined,
  ) {
    this.assertDriver(user);
    const result = await this.idempotency.execute(
      user.id,
      `POST:/orders/${orderId}/delivery/failed`,
      key,
      { orderId, ...dto },
      async (tx) => {
        const { order, driver } = await this.getAssignedOrderContext(tx, orderId, user.id);
        if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
          throw ApiException.conflict('ORDER_NOT_OUT_FOR_DELIVERY', 'Đơn không ở trạng thái đang giao');
        }

        const attempt = await tx.deliveryAttempt.create({
          data: {
            orderId: order.id,
            driverId: driver.id,
            actorId: user.id,
            status: DeliveryAttemptStatus.FAILED,
            failureReason: dto.reasonCode,
            note: dto.note,
          },
        });
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.DELIVERY_FAILED, version: { increment: 1 } },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            changedById: user.id,
            fromStatus: OrderStatus.OUT_FOR_DELIVERY,
            toStatus: OrderStatus.DELIVERY_FAILED,
            reason: dto.note ?? dto.reasonCode,
          },
        });
        const notification = await tx.notification.create({
          data: {
            userId: order.customerId,
            orderId: order.id,
            type: NotificationType.DELIVERY,
            title: 'Giao hàng chưa thành công',
            body: `Đơn ${order.trackingCode} chưa giao được. Bộ phận vận hành sẽ xử lý tiếp.`,
            resourceType: 'order',
            resourceId: order.id,
          },
        });
        return {
          attempt,
          order: updatedOrder,
          trackingCode: order.trackingCode,
          notification,
        };
      },
    );

    this.emitNotificationIfNew(result.notification);
    this.realtime.emitToOrder(orderId, 'order:status_changed', {
      orderId,
      trackingCode: result.trackingCode,
      fromStatus: OrderStatus.OUT_FOR_DELIVERY,
      toStatus: OrderStatus.DELIVERY_FAILED,
      actorId: user.id,
      reason: result.attempt.failureReason,
    }, result.order.version);
    await this.notifications.notifyManagers({
      type: NotificationType.DELIVERY,
      title: 'Có đơn giao hàng thất bại',
      body: `Đơn ${result.trackingCode} cần được quyết định giao lại hoặc hoàn hàng.`,
      resourceType: 'order',
      resourceId: orderId,
      orderId,
    });
    return result.attempt;
  }

  async startReturn(
    orderId: string,
    dto: StartReturnDto,
    user: User,
    key: string | undefined,
  ) {
    if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ MANAGER hoặc ADMIN được quyết định hoàn hàng');
    }
    const result = await this.idempotency.execute(
      user.id,
      `POST:/orders/${orderId}/return`,
      key,
      { orderId, ...dto },
      async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) throw ApiException.notFound('Không tìm thấy đơn hàng');
        if (![OrderStatus.DELIVERY_FAILED, OrderStatus.INCIDENT_HOLD].includes(order.status)) {
          throw ApiException.conflict(
            'ORDER_NOT_RETURNABLE',
            'Chỉ hoàn hàng khi đơn giao thất bại hoặc đang bị giữ do sự cố',
          );
        }
        const updated = await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.RETURNING, version: { increment: 1 } },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            changedById: user.id,
            fromStatus: order.status,
            toStatus: OrderStatus.RETURNING,
            reason: dto.reason,
          },
        });
        const notification = await tx.notification.create({
          data: {
            userId: order.customerId,
            orderId: order.id,
            type: NotificationType.ORDER_STATUS,
            title: 'Đơn hàng đang được hoàn',
            body: `Đơn ${order.trackingCode} đang được xử lý hoàn hàng`,
            resourceType: 'order',
            resourceId: order.id,
          },
        });
        return { order: updated, previousStatus: order.status, trackingCode: order.trackingCode, notification };
      },
    );

    this.emitNotificationIfNew(result.notification);
    this.realtime.emitToOrder(orderId, 'order:status_changed', {
      orderId,
      trackingCode: result.trackingCode,
      fromStatus: result.previousStatus,
      toStatus: OrderStatus.RETURNING,
      actorId: user.id,
      reason: dto.reason,
    }, result.order.version);
    return this.toOrderResponse(result.order);
  }

  private async getAssignedOrderContext(
    tx: Prisma.TransactionClient,
    orderId: string,
    userId: string,
  ) {
    const [order, driver] = await Promise.all([
      tx.order.findUnique({ where: { id: orderId } }),
      tx.driver.findFirst({
        where: {
          userId,
          isActive: true,
          deletedAt: null,
          user: { deletedAt: null, status: 'ACTIVE', role: Role.DRIVER },
        },
      }),
    ]);
    if (!order) throw ApiException.notFound('Không tìm thấy đơn hàng');
    if (!driver) throw ApiException.forbidden('FORBIDDEN', 'Tài khoản chưa có hồ sơ tài xế hợp lệ');

    const assignment = await tx.manifestItem.findFirst({
      where: {
        package: { is: { orderId } },
        manifest: {
          is: {
            trip: { is: { driverId: driver.id, status: TripStatus.ARRIVED } },
          },
        },
      },
      include: { manifest: { include: { trip: true } } },
    });
    if (!assignment) {
      throw ApiException.forbidden(
        'FORBIDDEN',
        'Bạn không được phân công chuyến đã đến bến đích có chứa đơn hàng này',
      );
    }
    return { order, driver, trip: assignment.manifest.trip };
  }

  private assertDriver(user: User) {
    if (user.role !== Role.DRIVER) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ tài xế được thực hiện thao tác giao hàng');
    }
  }

  private encryptOtp(code: string) {
    const key = createHash('sha256')
      .update(this.config.getOrThrow<string>('OTP_ENCRYPTION_KEY'))
      .digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
  }

  private decryptOtp(value: string) {
    const [ivHex, tagHex, encryptedHex] = value.split(':');
    const key = createHash('sha256')
      .update(this.config.getOrThrow<string>('OTP_ENCRYPTION_KEY'))
      .digest();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }

  private emitNotificationIfNew(notification: {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    orderId: string | null;
    resourceType: string | null;
    resourceId: string | null;
    createdAt: Date;
  }) {
    this.realtime.emitToUser(notification.userId, 'notification:new', {
      notificationId: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      orderId: notification.orderId,
      resourceType: notification.resourceType,
      resourceId: notification.resourceId,
      createdAt: notification.createdAt,
    });
  }

  private toOrderResponse(order: {
    id: string;
    trackingCode: string;
    customerId: string;
    recipientName: string;
    recipientPhone: string;
    originStationId: string;
    destinationStationId: string;
    description: string;
    packageCount: number;
    weightGrams: number;
    serviceLevel: string;
    codAmountVnd: number;
    shippingFeeVnd: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: order.id,
      trackingCode: order.trackingCode,
      customerId: order.customerId,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      originStationId: order.originStationId,
      destinationStationId: order.destinationStationId,
      description: order.description,
      packageCount: order.packageCount,
      weightGrams: order.weightGrams,
      serviceLevel: order.serviceLevel,
      codAmountVnd: order.codAmountVnd,
      shippingFeeVnd: order.shippingFeeVnd,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
