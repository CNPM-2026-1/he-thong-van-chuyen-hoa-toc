import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, ListUsersQueryDto, UpdateUserDto, UpdateUserStatusDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Roles('MANAGER', 'ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách tài khoản (tìm kiếm, lọc role/status, phân trang)' })
  list(@Query() q: ListUsersQueryDto) {
    return this.users.list(q);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản nhân viên / tài xế / quản lý' })
  create(@CurrentUser() actor: User, @Body() dto: CreateUserDto) {
    return this.users.create(actor, dto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Chi tiết tài khoản' })
  get(@Param('userId', ParseUUIDPipe) id: string) {
    return this.users.get(id);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Cập nhật tài khoản' })
  update(@CurrentUser() actor: User, @Param('userId', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(actor, id, dto);
  }

  @Patch(':userId/status')
  @ApiOperation({ summary: 'Khóa / mở khóa tài khoản' })
  updateStatus(@CurrentUser() actor: User, @Param('userId', ParseUUIDPipe) id: string, @Body() dto: UpdateUserStatusDto) {
    return this.users.updateStatus(actor, id, dto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Xóa mềm tài khoản' })
  remove(@CurrentUser() actor: User, @Param('userId', ParseUUIDPipe) id: string) {
    return this.users.remove(actor, id);
  }
}
