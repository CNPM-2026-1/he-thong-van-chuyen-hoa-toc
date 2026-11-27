import { Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ListNotificationsQueryDto } from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo của tài khoản hiện tại' })
  list(@Query() query: ListNotificationsQueryDto, @CurrentUser() user: User) {
    return this.notifications.list(query, user);
  }

  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  markRead(
    @Param('notificationId', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.notifications.markRead(id, user);
  }
}
