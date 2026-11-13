import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/api-exception';
import { toUserResponse } from '../users/user.mapper';
import { LoginDto, RegisterDto } from './dto/auth.dto';

export const BCRYPT_ROUNDS = 10;
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    await this.ensureUnique(dto.email, dto.phone);
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        role: 'CUSTOMER',
      },
    });
    return toUserResponse(user);
  }

  async login(dto: LoginDto) {
    const id = dto.identifier.trim();
    const user = await this.prisma.user.findFirst({
      where: { deletedAt: null, OR: [{ email: id.toLowerCase() }, { phone: id }] },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw ApiException.unauthorized('INVALID_CREDENTIALS', 'Sai tài khoản hoặc mật khẩu');
    }
    if (user.status !== 'ACTIVE') {
      throw ApiException.forbidden('ACCOUNT_LOCKED', 'Tài khoản đã bị khóa');
    }
    const tokens = await this.issueTokens(user);
    return { ...tokens, user: toUserResponse(user) };
  }

  /** Đổi refresh token cũ lấy cặp token mới (refresh token cũ bị thu hồi). */
  async refresh(refreshToken: string) {
    const record = await this.verifyRefreshToken(refreshToken);
    if (record.user.status !== 'ACTIVE' || record.user.deletedAt) {
      throw ApiException.forbidden('ACCOUNT_LOCKED', 'Tài khoản đã bị khóa');
    }
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(record.user);
  }

  async logout(userId: string, refreshToken: string) {
    const record = await this.verifyRefreshToken(refreshToken).catch(() => null);
    if (record && record.userId === userId) {
      await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    }
    return { message: 'Operation completed' };
  }

  /** Thu hồi mọi refresh token của user (dùng khi khóa tài khoản). */
  async revokeAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async ensureUnique(email: string | undefined | null, phone: string | undefined, excludeId?: string) {
    const or = [] as any[];
    if (email) or.push({ email: email.toLowerCase() });
    if (phone) or.push({ phone });
    if (!or.length) return;
    const existing = await this.prisma.user.findFirst({ where: { OR: or, NOT: excludeId ? { id: excludeId } : undefined } });
    if (existing) {
      const field = email && existing.email === email.toLowerCase() ? 'Email' : 'Số điện thoại';
      throw new ApiException(HttpStatus.CONFLICT, 'DUPLICATE', `${field} đã được sử dụng`);
    }
  }

  private async issueTokens(user: User) {
    const jti = randomUUID();
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role, type: 'access' },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh', jti },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );
    const { exp } = this.jwt.decode(refreshToken) as { exp: number };
    await this.prisma.refreshToken.create({
      data: { id: jti, userId: user.id, tokenHash: sha256(refreshToken), expiresAt: new Date(exp * 1000) },
    });
    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string) {
    let payload: { sub: string; type?: string; jti?: string };
    try {
      payload = await this.jwt.verifyAsync(token, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') });
    } catch {
      throw ApiException.unauthorized('TOKEN_INVALID', 'Refresh token không hợp lệ hoặc đã hết hạn');
    }
    if (payload.type !== 'refresh' || !payload.jti) {
      throw ApiException.unauthorized('TOKEN_INVALID', 'Refresh token không hợp lệ');
    }
    const record = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti }, include: { user: true } });
    if (!record || record.revokedAt || record.tokenHash !== sha256(token) || record.expiresAt < new Date()) {
      throw ApiException.unauthorized('TOKEN_INVALID', 'Refresh token đã bị thu hồi');
    }
    return record;
  }
}
