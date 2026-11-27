import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { ManifestController } from './manifest.controller';
import { ManifestService } from './manifest.service';

@Module({
  imports: [RealtimeModule],
  controllers: [ManifestController],
  providers: [ManifestService],
})
export class ManifestModule {}
