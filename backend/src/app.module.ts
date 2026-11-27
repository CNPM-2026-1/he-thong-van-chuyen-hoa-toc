import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StationsModule } from './stations/stations.module';
import { RoutesModule } from './routes/routes.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { PriceRulesModule } from './price-rules/price-rules.module';
import { TripsModule } from './trips/trips.module';
import { TrackingModule } from './tracking/tracking.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ManifestModule } from './manifest/manifest.module';
import { DeliveryModule } from './delivery/delivery.module';
import { CodModule } from './cod/cod.module';
import { IncidentsModule } from './incidents/incidents.module';
import { StatisticsModule } from './statistics/statistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MediaModule } from './media/media.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StationsModule,
    RoutesModule,
    VehiclesModule,
    DriversModule,
    PriceRulesModule,
    TripsModule,
    TrackingModule,
    RealtimeModule,
    ManifestModule,
    DeliveryModule,
    CodModule,
    IncidentsModule,
    StatisticsModule,
    NotificationsModule,
    MediaModule,
  ],
  providers: [
    // Mặc định mọi route đều cần đăng nhập; dùng @Public() để mở.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
