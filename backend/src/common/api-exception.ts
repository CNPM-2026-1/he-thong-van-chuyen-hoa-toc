import { HttpException, HttpStatus } from '@nestjs/common';

/** Lỗi nghiệp vụ, trả về body { code, message } theo hợp đồng chung. */
export class ApiException extends HttpException {
  constructor(status: HttpStatus, public readonly code: string, message: string) {
    super({ code, message }, status);
  }

  static badRequest(code: string, message: string) {
    return new ApiException(HttpStatus.BAD_REQUEST, code, message);
  }
  static unauthorized(code: string, message: string) {
    return new ApiException(HttpStatus.UNAUTHORIZED, code, message);
  }
  static forbidden(code: string, message: string) {
    return new ApiException(HttpStatus.FORBIDDEN, code, message);
  }
  static notFound(message = 'Không tìm thấy dữ liệu') {
    return new ApiException(HttpStatus.NOT_FOUND, 'NOT_FOUND', message);
  }
  static conflict(code: string, message: string) {
    return new ApiException(HttpStatus.CONFLICT, code, message);
  }
}
