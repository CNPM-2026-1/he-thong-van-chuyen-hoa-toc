import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodTransactionStatus } from '@prisma/client';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ListCodTransactionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CodTransactionStatus })
  @IsOptional()
  @IsEnum(CodTransactionStatus)
  status?: CodTransactionStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  tripId?: string;
}

export class CreateCodReconciliationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all')
  tripId: string;

  @ApiProperty({ type: [String], format: 'uuid' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  transactionIds: string[];

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  countedAmountVnd: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
