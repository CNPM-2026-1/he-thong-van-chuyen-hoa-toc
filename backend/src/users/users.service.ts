import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/api-exception';
import { paginated, searchOr, skipTake } from '../common/utils';
import { AuthService, BCRYPT_ROUNDS } from '../auth/auth.service';
import { toUserResponse } from './user.mapper';
import { CreateUserDto, ListUsersQueryDto, UpdateUserDto, UpdateUserStatusDto } from './dto/user.dto';

/** MANAGER chỉ quản lý được STAFF/DRIVER/CUSTOMER; ADMIN quản lý được tất cả. */
const MANAGEABLE_BY_MANAGER: Role[] = ['STAFF', 'DRIVER', 'CUSTOMER'];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async list(q: ListUsersQueryDto) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: q.role,
      status: q.status,
      ...searchOr(q.search, ['fullName', 'email', 'phone']),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.user.count({ where }),
    ]);
    return paginated(items.map(toUserResponse), q.page, total);
  }

  async get(id: string) {
    return toUserResponse(await this.findOrThrow(id));
  }

  async create(actor: User, dto: CreateUserDto) {
    this.assertCanAssignRole(actor, dto.role);
    await this.auth.ensureUnique(dto.email, dto.phone);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        role: dto.role,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      },
    });
    return toUserResponse(user);
  }

  async update(actor: User, id: string, dto: UpdateUserDto) {
    const target = await this.findOrThrow(id);
    this.assertCanManage(actor, target);
    if (dto.role && dto.role !== target.role) {
      if (actor.id === target.id) throw ApiException.forbidden('FORBIDDEN', 'Không thể tự đổi vai trò của mình');
      this.assertCanAssignRole(actor, dto.role);
    }
    await this.auth.ensureUnique(dto.email, dto.phone, id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { ...dto, email: dto.email?.toLowerCase(), fullName: dto.fullName?.trim() },
    });
    return toUserResponse(user);
  }

  /** Khóa / mở khóa tài khoản. */
  async updateStatus(actor: User, id: string, dto: UpdateUserStatusDto) {
    const target = await this.findOrThrow(id);
    if (actor.id === target.id) throw ApiException.forbidden('FORBIDDEN', 'Không thể tự khóa tài khoản của mình');
    this.assertCanManage(actor, target);
    const user = await this.prisma.user.update({ where: { id }, data: { status: dto.status } });
    if (dto.status !== 'ACTIVE') await this.auth.revokeAll(id);
    return toUserResponse(user);
  }

  /** Xóa mềm: đánh dấu deletedAt + INACTIVE, dữ liệu liên quan vẫn còn. */
  async remove(actor: User, id: string) {
    const target = await this.findOrThrow(id);
    if (actor.id === target.id) throw ApiException.forbidden('FORBIDDEN', 'Không thể tự xóa tài khoản của mình');
    this.assertCanManage(actor, target);
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    await this.auth.revokeAll(id);
    return { message: 'Operation completed' };
  }

  private async findOrThrow(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw ApiException.notFound('Không tìm thấy tài khoản');
    return user;
  }

  private assertCanManage(actor: User, target: User) {
    if (actor.role === 'ADMIN' || actor.id === target.id) return;
    if (!MANAGEABLE_BY_MANAGER.includes(target.role)) {
      throw ApiException.forbidden('FORBIDDEN', 'Bạn không có quyền quản lý tài khoản này');
    }
  }

  private assertCanAssignRole(actor: User, role: Role) {
    if (actor.role === 'ADMIN') return;
    if (!MANAGEABLE_BY_MANAGER.includes(role)) {
      throw ApiException.forbidden('FORBIDDEN', `Bạn không có quyền gán vai trò ${role}`);
    }
  }
}
