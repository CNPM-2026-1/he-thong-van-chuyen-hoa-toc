import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsUUID, Min, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ToBoolean } from '../../common/utils';

export class PriceRuleInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: 'routeId không hợp lệ' })
  routeId: string;

  @ApiProperty({ example: 30000, description: 'Phí cơ bản (VND)' })
  @IsInt({ message: 'baseFeeVnd phải là số nguyên' })
  @Min(0)
  baseFeeVnd: number;

  @ApiProperty({ example: 5000, description: 'Đơn giá mỗi kg (VND)' })
  @IsInt({ message: 'pricePerKgVnd phải là số nguyên' })
  @Min(0)
  pricePerKgVnd: number;

  @ApiPropertyOptional({ example: 1.5, default: 1, description: 'Hệ số hỏa tốc (>= 1)' })
  @IsOptional()
  @IsNumber({}, { message: 'expressMultiplier phải là số' })
  @Min(1, { message: 'expressMultiplier phải >= 1' })
  expressMultiplier?: number;

  @ApiPropertyOptional({ example: 15000, default: 0, description: 'Phí thu hộ COD (VND)' })
  @IsOptional()
  @IsInt({ message: 'codFeeVnd phải là số nguyên' })
  @Min(0)
  codFeeVnd?: number;

  @ApiProperty({ example: '2026-11-01T00:00:00Z' })
  @IsDateString({}, { message: 'effectiveFrom phải là ngày giờ ISO-8601' })
  effectiveFrom: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString({}, { message: 'effectiveTo phải là ngày giờ ISO-8601' })
  effectiveTo?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePriceRuleDto extends PartialType(PriceRuleInputDto) {}

export class ListPriceRulesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  routeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
