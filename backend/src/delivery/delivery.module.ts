import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { SmsService } from './sms.service';

@Module({
  imports: [RealtimeModule, NotificationsModule],
  controllers: [DeliveryController],
  providers: [DeliveryService, SmsService],
})
export class DeliveryModule {}
