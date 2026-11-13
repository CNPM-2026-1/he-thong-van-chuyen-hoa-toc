import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RoutesService } from './routes.service';
import { ListRoutesQueryDto, RouteInputDto, UpdateRouteDto } from './dto/route.dto';

@ApiTags('Routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách tuyến (mọi vai trò)' })
  list(@Query() q: ListRoutesQueryDto) {
    return this.routes.list(q);
  }

  @Get(':routeId')
  @ApiOperation({ summary: 'Chi tiết tuyến' })
  get(@Param('routeId', ParseUUIDPipe) id: string) {
    return this.routes.get(id);
  }

  @Post()
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Thêm tuyến' })
  create(@Body() dto: RouteInputDto) {
    return this.routes.create(dto);
  }

  @Patch(':routeId')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Sửa tuyến' })
  update(@Param('routeId', ParseUUIDPipe) id: string, @Body() dto: UpdateRouteDto) {
    return this.routes.update(id, dto);
  }

  @Delete(':routeId')
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Xóa mềm tuyến' })
  remove(@Param('routeId', ParseUUIDPipe) id: string) {
    return this.routes.remove(id);
  }
}
