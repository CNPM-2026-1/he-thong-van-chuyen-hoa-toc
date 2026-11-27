import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ManifestController } from './manifest.controller';
import { ManifestService } from './manifest.service';

@Module({
  imports: [RealtimeModule, NotificationsModule],
  controllers: [ManifestController],
  providers: [ManifestService],
})
export class ManifestModule {}
