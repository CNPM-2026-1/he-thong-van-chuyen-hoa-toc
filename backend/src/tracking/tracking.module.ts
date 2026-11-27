import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [RealtimeModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
