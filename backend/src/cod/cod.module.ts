import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { CodController } from './cod.controller';
import { CodService } from './cod.service';

@Module({
  imports: [RealtimeModule],
  controllers: [CodController],
  providers: [CodService],
})
export class CodModule {}
