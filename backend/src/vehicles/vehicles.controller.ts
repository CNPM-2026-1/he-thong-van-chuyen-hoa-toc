import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { VehiclesService } from './vehicles.service';
import { ListVehiclesQueryDto, UpdateVehicleDto, VehicleInputDto } from './dto/vehicle.dto';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Roles('MANAGER', 'ADMIN')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách xe' })
  list(@Query() q: ListVehiclesQueryDto) {
    return this.vehicles.list(q);
  }

  @Get(':vehicleId')
  @ApiOperation({ summary: 'Chi tiết xe' })
  get(@Param('vehicleId', ParseUUIDPipe) id: string) {
    return this.vehicles.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm xe' })
  create(@Body() dto: VehicleInputDto) {
    return this.vehicles.create(dto);
  }

  @Patch(':vehicleId')
  @ApiOperation({ summary: 'Sửa xe' })
  update(@Param('vehicleId', ParseUUIDPipe) id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(id, dto);
  }

  @Delete(':vehicleId')
  @ApiOperation({ summary: 'Xóa mềm xe' })
  remove(@Param('vehicleId', ParseUUIDPipe) id: string) {
    return this.vehicles.remove(id);
  }
}
