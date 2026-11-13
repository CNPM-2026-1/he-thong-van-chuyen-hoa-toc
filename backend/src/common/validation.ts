import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ApiException } from './api-exception';

function firstMessage(errors: ValidationError[]): string {
  for (const e of errors) {
    if (e.constraints) return Object.values(e.constraints)[0];
    if (e.children?.length) return firstMessage(e.children);
  }
  return 'Dữ liệu không hợp lệ';
}

export function buildValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => ApiException.badRequest('VALIDATION_ERROR', firstMessage(errors)),
  });
}
