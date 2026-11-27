import { Injectable } from '@nestjs/common';
import {
  CodReconciliationStatus,
  CodTransactionStatus,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { ApiException } from '../common/api-exception';
import { IdempotencyService } from '../common/idempotency.service';
import { paginated, skipTake } from '../common/utils';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateCodReconciliationDto, ListCodTransactionsQueryDto } from './dto/cod.dto';

@Injectable()
export class CodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async listTransactions(query: ListCodTransactionsQueryDto, user: User) {
    this.assertManagerOrAdmin(user);
    const where: Prisma.CodTransactionWhereInput = {
      status: query.status,
      tripId: query.tripId,
      ...(query.search?.trim()
        ? {
            OR: [
              { order: { is: { trackingCode: { contains: query.search.trim(), mode: 'insensitive' } } } },
              { order: { is: { recipientName: { contains: query.search.trim(), mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.codTransaction.findMany({
        where,
        orderBy: { collectedAt: 'desc' },
        ...skipTake(query),
      }),
      this.prisma.codTransaction.count({ where }),
    ]);
    return paginated(
      rows.map((row) => ({
        id: row.id,
        orderId: row.orderId,
        tripId: row.tripId,
        amountVnd: row.amountVnd,
        status: row.status,
        collectedAt: row.collectedAt,
      })),
      query.page,
      total,
    );
  }

  async createReconciliation(
    dto: CreateCodReconciliationDto,
    user: User,
    key: string | undefined,
  ) {
    this.assertManagerOrAdmin(user);
    if (new Set(dto.transactionIds).size !== dto.transactionIds.length) {
      throw ApiException.badRequest('VALIDATION_ERROR', 'transactionIds không được chứa phần tử trùng lặp');
    }

    const result = await this.idempotency.execute(
      user.id,
      'POST:/cod/reconciliations',
      key,
      dto,
      async (tx) => {
        const trip = await tx.trip.findUnique({ where: { id: dto.tripId } });
        if (!trip) throw ApiException.notFound('Không tìm thấy chuyến xe');

        const transactions = await tx.codTransaction.findMany({
          where: {
            id: { in: dto.transactionIds },
            tripId: trip.id,
            status: CodTransactionStatus.PENDING_REMITTANCE,
          },
        });
        if (transactions.length !== dto.transactionIds.length) {
          throw ApiException.conflict(
            'COD_TRANSACTION_NOT_RECONCILABLE',
            'Có giao dịch không thuộc chuyến, đã được đối soát hoặc không còn ở trạng thái chờ nộp',
          );
        }

        const expectedAmountVnd = transactions.reduce((sum, item) => sum + item.amountVnd, 0);
        const differenceVnd = dto.countedAmountVnd - expectedAmountVnd;
        const status =
          differenceVnd === 0
            ? CodReconciliationStatus.MATCHED
            : CodReconciliationStatus.MISMATCH_PENDING_REVIEW;

        const reconciliation = await tx.codReconciliation.create({
          data: {
            tripId: trip.id,
            reconciledById: user.id,
            expectedAmountVnd,
            countedAmountVnd: dto.countedAmountVnd,
            differenceVnd,
            status,
            note: dto.note,
          },
        });

        await tx.codReconciliationItem.createMany({
          data: transactions.map((transaction) => ({
            reconciliationId: reconciliation.id,
            transactionId: transaction.id,
          })),
        });

        if (status === CodReconciliationStatus.MATCHED) {
          await tx.codTransaction.updateMany({
            where: { id: { in: dto.transactionIds }, status: CodTransactionStatus.PENDING_REMITTANCE },
            data: { status: CodTransactionStatus.RECONCILED },
          });
        }

        const updatedTrip = await tx.trip.update({
          where: { id: trip.id },
          data: { version: { increment: 1 } },
        });
        return { reconciliation, tripVersion: updatedTrip.version };
      },
    );

    const reconciliation = result.reconciliation;
    this.realtime.emitToTrip(dto.tripId, 'cod:reconciled', {
      reconciliationId: reconciliation.id,
      tripId: reconciliation.tripId,
      expectedAmountVnd: reconciliation.expectedAmountVnd,
      countedAmountVnd: reconciliation.countedAmountVnd,
      differenceVnd: reconciliation.differenceVnd,
      status: reconciliation.status,
    }, result.tripVersion);
    return {
      id: reconciliation.id,
      tripId: reconciliation.tripId,
      expectedAmountVnd: reconciliation.expectedAmountVnd,
      countedAmountVnd: reconciliation.countedAmountVnd,
      differenceVnd: reconciliation.differenceVnd,
      status: reconciliation.status,
      createdAt: reconciliation.createdAt,
    };
  }

  private assertManagerOrAdmin(user: User) {
    if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      throw ApiException.forbidden('FORBIDDEN', 'Chỉ MANAGER hoặc ADMIN được xem và đối soát COD');
    }
  }
}
