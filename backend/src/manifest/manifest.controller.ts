import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AddManifestOrderDto, UpdateManifestItemDto } from './dto/manifest.dto';
import { ManifestService } from './manifest.service';

@ApiTags('Manifest')
@ApiBearerAuth()
@Controller()
export class ManifestController {
  constructor(private readonly manifest: ManifestService) {}

  @Get('trips/:tripId/manifest')
  @Roles(Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Xem bảng kê kiện hàng của chuyến' })
  getManifest(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @CurrentUser() user: User,
  ) {
    return this.manifest.getManifest(tripId, user);
  }

  @Post('trips/:tripId/manifest/items')
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'UUID cho thao tác thêm đơn vào manifest' })
  @ApiOperation({ summary: 'Thêm tất cả kiện của một đơn vào manifest' })
  addOrder(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @Body() dto: AddManifestOrderDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.manifest.addOrderToManifest(tripId, dto, user, key);
  }

  @Patch('manifest/items/:itemId')
  @Roles(Role.DRIVER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Xác nhận xếp/dỡ hoặc báo thiếu/hỏng kiện' })
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateManifestItemDto,
    @CurrentUser() user: User,
  ) {
    return this.manifest.updateItem(itemId, dto, user);
  }
}
