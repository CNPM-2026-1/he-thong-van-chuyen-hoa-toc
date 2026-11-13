import { Module } from '@nestjs/common';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({ imports: [VehiclesModule], controllers: [DriversController], providers: [DriversService] })
export class DriversModule {}
