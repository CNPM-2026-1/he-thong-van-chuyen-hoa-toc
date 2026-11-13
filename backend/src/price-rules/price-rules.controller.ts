import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { PriceRulesService } from './price-rules.service';
import { ListPriceRulesQueryDto, PriceRuleInputDto, UpdatePriceRuleDto } from './dto/price-rule.dto';

@ApiTags('Price rules')
@ApiBearerAuth()
@Roles('MANAGER', 'ADMIN')
@Controller('price-rules')
export class PriceRulesController {
  constructor(private readonly priceRules: PriceRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách bảng giá (lọc theo tuyến)' })
  list(@Query() q: ListPriceRulesQueryDto) {
    return this.priceRules.list(q);
  }

  @Get(':priceRuleId')
  @ApiOperation({ summary: 'Chi tiết bảng giá' })
  get(@Param('priceRuleId', ParseUUIDPipe) id: string) {
    return this.priceRules.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm bảng giá' })
  create(@Body() dto: PriceRuleInputDto) {
    return this.priceRules.create(dto);
  }

  @Patch(':priceRuleId')
  @ApiOperation({ summary: 'Sửa bảng giá' })
  update(@Param('priceRuleId', ParseUUIDPipe) id: string, @Body() dto: UpdatePriceRuleDto) {
    return this.priceRules.update(id, dto);
  }

  @Delete(':priceRuleId')
  @ApiOperation({ summary: 'Xóa mềm bảng giá' })
  remove(@Param('priceRuleId', ParseUUIDPipe) id: string) {
    return this.priceRules.remove(id);
  }
}
