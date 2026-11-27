import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CodService } from './cod.service';
import { CreateCodReconciliationDto, ListCodTransactionsQueryDto } from './dto/cod.dto';

@ApiTags('COD')
@ApiBearerAuth()
@Controller('cod')
@Roles(Role.MANAGER, Role.ADMIN)
export class CodController {
  constructor(private readonly cod: CodService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Danh sách giao dịch COD' })
  list(
    @Query() query: ListCodTransactionsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.cod.listTransactions(query, user);
  }

  @Post('reconciliations')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Tạo phiếu đối soát COD cho chuyến' })
  reconcile(
    @Body() dto: CreateCodReconciliationDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.cod.createReconciliation(dto, user, key);
  }
}
