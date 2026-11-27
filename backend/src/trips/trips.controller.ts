import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTripDto, ListTripsQueryDto, UpdateTripStatusDto } from './dto/trip.dto';
import { TripsService } from './trips.service';

@ApiTags('Trips')
@ApiBearerAuth()
@Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get()
  @Roles(Role.STAFF, Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Danh sách chuyến xe' })
  list(@Query() query: ListTripsQueryDto, @CurrentUser() user: User) {
    return this.trips.list(query, user);
  }

  @Post()
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description: 'UUID; gửi lại cùng key và payload sẽ nhận lại kết quả tạo chuyến ban đầu',
  })
  @ApiOperation({ summary: 'Tạo chuyến xe' })
  create(
    @Body() dto: CreateTripDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.trips.create(dto, user, idempotencyKey);
  }

  @Get(':tripId')
  @Roles(Role.STAFF, Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Chi tiết chuyến xe' })
  get(@Param('tripId', ParseUUIDPipe) tripId: string, @CurrentUser() user: User) {
    return this.trips.get(tripId, user);
  }

  @Patch(':tripId/status')
  @Roles(Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật trạng thái chuyến xe theo luồng hợp lệ' })
  updateStatus(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() dto: UpdateTripStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.trips.updateStatus(tripId, dto, user);
  }
}
