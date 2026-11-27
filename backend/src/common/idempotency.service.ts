import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { createHash } from 'crypto';
import { ApiException } from './api-exception';
import { PrismaService } from '../prisma/prisma.service';

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(object)
        .sort()
        .map((key) => [key, canonicalize(object[key])]),
    );
  }
  return value;
}

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(
    actorId: string,
    operation: string,
    key: string | undefined,
    payload: unknown,
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    if (!key || !isUUID(key)) {
      throw ApiException.badRequest(
        'VALIDATION_ERROR',
        'Header Idempotency-Key là bắt buộc và phải có định dạng UUID',
      );
    }

    const serializedPayload = JSON.stringify(canonicalize(payload)) ?? 'null';
    const requestHash = createHash('sha256')
      .update(serializedPayload)
      .digest('hex');

    const where = {
      actorId_operation_key: { actorId, operation, key },
    };

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const existing = await tx.idempotencyRecord.findUnique({ where });

          if (existing && existing.expiresAt > new Date()) {
            if (existing.requestHash !== requestHash) {
              throw ApiException.conflict(
                'IDEMPOTENCY_KEY_REUSED',
                'Idempotency-Key đã được dùng với nội dung request khác',
              );
            }
            return existing.response as unknown as T;
          }

          if (existing) {
            await tx.idempotencyRecord.delete({ where: { id: existing.id } });
          }

          const result = await work(tx);
          const serializedResponse = JSON.stringify(result);
          if (serializedResponse === undefined) {
            throw new Error('Idempotent operation must return a JSON-serializable response');
          }
          const response = JSON.parse(serializedResponse) as Prisma.InputJsonValue;

          await tx.idempotencyRecord.create({
            data: {
              actorId,
              operation,
              key,
              requestHash,
              response,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });

          return result;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || error.code === 'P2034')
      ) {
        const existing = await this.prisma.idempotencyRecord.findUnique({ where });
        if (existing && existing.expiresAt > new Date()) {
          if (existing.requestHash !== requestHash) {
            throw ApiException.conflict(
              'IDEMPOTENCY_KEY_REUSED',
              'Idempotency-Key đã được dùng với nội dung request khác',
            );
          }
          return existing.response as unknown as T;
        }
        if (error.code === 'P2034') {
          throw ApiException.conflict(
            'CONCURRENT_MODIFICATION',
            'Dữ liệu vừa được cập nhật đồng thời; vui lòng thử lại với cùng Idempotency-Key',
          );
        }
      }
      throw error;
    }
  }
}
