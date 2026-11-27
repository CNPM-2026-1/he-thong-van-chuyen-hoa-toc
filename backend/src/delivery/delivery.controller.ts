import { Body, Controller, Headers, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { DeliveryConfirmDto, DeliveryFailedDto, StartReturnDto } from './dto/delivery.dto';
import { DeliveryService } from './delivery.service';

@ApiTags('Delivery')
@ApiBearerAuth()
@Controller('orders/:orderId')
export class DeliveryController {
  constructor(private readonly delivery: DeliveryService) {}

  @Post('delivery/start')
  @Roles(Role.DRIVER)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Bắt đầu giao hàng' })
  start(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.delivery.startDelivery(orderId, user, key);
  }

  @Post('delivery/otp')
  @Roles(Role.DRIVER)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Yêu cầu gửi OTP cho người nhận' })
  requestOtp(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.delivery.requestDeliveryOtp(orderId, user, key);
  }

  @Post('delivery/confirm')
  @Roles(Role.DRIVER)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Xác nhận giao hàng bằng OTP' })
  confirm(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: DeliveryConfirmDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.delivery.confirmDelivery(orderId, dto, user, key);
  }

  @Post('delivery/failed')
  @Roles(Role.DRIVER)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Ghi nhận giao hàng thất bại' })
  failed(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: DeliveryFailedDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.delivery.recordDeliveryFailure(orderId, dto, user, key);
  }

  @Post('return')
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Bắt đầu hoàn hàng theo quyết định quản lý' })
  startReturn(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: StartReturnDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.delivery.startReturn(orderId, dto, user, key);
  }
}
