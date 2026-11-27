import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { DateRangeQueryDto } from './dto/statistics.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Statistics')
@ApiBearerAuth()
@Controller('statistics')
@Roles(Role.MANAGER, Role.ADMIN)
export class StatisticsController {
  constructor(private readonly statistics: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Thống kê tổng quan' })
  overview(@Query() query: DateRangeQueryDto, @CurrentUser() user: User) {
    return this.statistics.overview(query, user);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Thống kê đơn hàng theo trạng thái và dịch vụ' })
  orders(@Query() query: DateRangeQueryDto, @CurrentUser() user: User) {
    return this.statistics.orders(query, user);
  }

  @Get('cod')
  @ApiOperation({ summary: 'Thống kê thu và đối soát COD' })
  cod(@Query() query: DateRangeQueryDto, @CurrentUser() user: User) {
    return this.statistics.cod(query, user);
  }
}
