import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateIncidentDto, ListIncidentsQueryDto, UpdateIncidentDto } from './dto/incident.dto';
import { IncidentsService } from './incidents.service';

@ApiTags('Incidents')
@ApiBearerAuth()
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  @Get()
  @Roles(Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Danh sách sự cố' })
  list(@Query() query: ListIncidentsQueryDto, @CurrentUser() user: User) {
    return this.incidents.list(query, user);
  }

  @Post()
  @Roles(Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Báo sự cố' })
  create(
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.incidents.create(dto, user, key);
  }

  @Get(':incidentId')
  @Roles(Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Chi tiết sự cố' })
  get(
    @Param('incidentId', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.incidents.get(id, user);
  }

  @Patch(':incidentId')
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật/xử lý sự cố' })
  update(
    @Param('incidentId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
    @CurrentUser() user: User,
  ) {
    return this.incidents.update(id, dto, user);
  }
}
