import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ApiException } from '../api-exception';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const [type, token] = (req.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) {
      throw ApiException.unauthorized('UNAUTHORIZED', 'Thiếu access token');
    }

    let payload: { sub: string; type?: string };
    try {
      payload = await this.jwt.verifyAsync(token, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET') });
    } catch {
      throw ApiException.unauthorized('TOKEN_INVALID', 'Access token không hợp lệ hoặc đã hết hạn');
    }
    if (payload.type !== 'access') {
      throw ApiException.unauthorized('TOKEN_INVALID', 'Access token không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.deletedAt) throw ApiException.unauthorized('TOKEN_INVALID', 'Tài khoản không tồn tại');
    if (user.status !== 'ACTIVE') throw ApiException.forbidden('ACCOUNT_LOCKED', 'Tài khoản đã bị khóa');

    req.user = user;
    return true;
  }
}
