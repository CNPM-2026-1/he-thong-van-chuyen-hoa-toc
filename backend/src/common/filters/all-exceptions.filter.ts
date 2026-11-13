import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const DEFAULT_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
};

/** Chuẩn hóa mọi lỗi về dạng { code, message }. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Lỗi hệ thống';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse() as any;
      code = body?.code ?? DEFAULT_CODES[status] ?? 'ERROR';
      const msg = typeof body === 'string' ? body : body?.message;
      message = Array.isArray(msg) ? msg[0] : msg ?? exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'DUPLICATE';
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        message = `Giá trị đã tồn tại${target ? `: ${target}` : ''}`;
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = 'Không tìm thấy dữ liệu';
      } else if (exception.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        code = 'INVALID_REFERENCE';
        message = 'Dữ liệu tham chiếu không tồn tại';
      } else {
        this.logger.error(exception);
      }
    } else {
      this.logger.error(exception);
    }

    res.status(status).json({ code, message });
  }
}
