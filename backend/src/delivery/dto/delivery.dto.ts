import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryFailureReason } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class DeliveryConfirmDto {
  @ApiProperty({ example: '123456', pattern: '^\\d{6}$' })
  @Matches(/^\d{6}$/, { message: 'OTP phải gồm đúng 6 chữ số' })
  otp: string;

  @ApiPropertyOptional({ type: [String], example: ['delivery-proof/2026/11/proof.jpg'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  photoObjectKeys?: string[];

  @ApiPropertyOptional({ example: 'Tran Thi D' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientName?: string;

  @ApiPropertyOptional({ example: 500000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  codCollectedVnd?: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class DeliveryFailedDto {
  @ApiProperty({ enum: DeliveryFailureReason })
  @IsEnum(DeliveryFailureReason)
  reasonCode: DeliveryFailureReason;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class StartReturnDto {
  @ApiProperty({ example: 'Khách không nhận hàng sau nhiều lần liên hệ' })
  @IsString()
  @MaxLength(500)
  reason: string;
}
