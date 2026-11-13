import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { DriversService } from './drivers.service';
import { DriverInputDto, ListDriversQueryDto, UpdateDriverDto } from './dto/driver.dto';

@ApiTags('Drivers')
@ApiBearerAuth()
@Roles('MANAGER', 'ADMIN')
@Controller('drivers')
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách tài xế (tìm theo tên, SĐT, số GPLX)' })
  list(@Query() q: ListDriversQueryDto) {
    return this.drivers.list(q);
  }

  @Get(':driverId')
  @ApiOperation({ summary: 'Chi tiết tài xế' })
  get(@Param('driverId', ParseUUIDPipe) id: string) {
    return this.drivers.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo hồ sơ tài xế cho tài khoản DRIVER' })
  create(@Body() dto: DriverInputDto) {
    return this.drivers.create(dto);
  }

  @Patch(':driverId')
  @ApiOperation({ summary: 'Sửa tài xế / gán xe mặc định' })
  update(@Param('driverId', ParseUUIDPipe) id: string, @Body() dto: UpdateDriverDto) {
    return this.drivers.update(id, dto);
  }

  @Delete(':driverId')
  @ApiOperation({ summary: 'Xóa mềm tài xế' })
  remove(@Param('driverId', ParseUUIDPipe) id: string) {
    return this.drivers.remove(id);
  }
}
