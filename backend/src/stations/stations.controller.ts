import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { StationsService } from './stations.service';
import { ListStationsQueryDto, StationInputDto, UpdateStationDto } from './dto/station.dto';

@ApiTags('Stations')
@ApiBearerAuth()
@Controller('stations')
export class StationsController {
  constructor(private readonly stations: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách bến/văn phòng (mọi vai trò)' })
  list(@Query() q: ListStationsQueryDto) {
    return this.stations.list(q);
  }

  @Get(':stationId')
  @ApiOperation({ summary: 'Chi tiết bến' })
  get(@Param('stationId', ParseUUIDPipe) id: string) {
    return this.stations.get(id);
  }

  @Post()
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Thêm bến' })
  create(@Body() dto: StationInputDto) {
    return this.stations.create(dto);
  }

  @Patch(':stationId')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Sửa bến' })
  update(@Param('stationId', ParseUUIDPipe) id: string, @Body() dto: UpdateStationDto) {
    return this.stations.update(id, dto);
  }

  @Delete(':stationId')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Xóa mềm bến' })
  remove(@Param('stationId', ParseUUIDPipe) id: string) {
    return this.stations.remove(id);
  }
}
