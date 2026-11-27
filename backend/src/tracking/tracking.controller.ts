import { Controller, Get, Param, ParseUUIDPipe, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTripLocationDto } from './dto/trip-location.dto';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@ApiBearerAuth()
@Controller('trips')
export class TrackingController {
  constructor(private readonly tracking: TrackingService) {}

  @Post(':tripId/locations')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Gửi tọa độ GPS của chuyến' })
  createLocation(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() dto: CreateTripLocationDto,
    @CurrentUser() user: User,
  ) {
    return this.tracking.createLocation(tripId, dto, user);
  }

  @Get(':tripId/locations/latest')
  @Roles(Role.STAFF, Role.DRIVER, Role.MANAGER, Role.ADMIN, Role.CUSTOMER)
  @ApiOperation({ summary: 'Lấy vị trí mới nhất của chuyến' })
  getLatestLocation(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @CurrentUser() user: User,
  ) {
    return this.tracking.getLatestLocation(tripId, user);
  }
}
