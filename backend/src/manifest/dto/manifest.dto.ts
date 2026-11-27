import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ManifestItemStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddManifestOrderDto {
  @ApiProperty({ format: 'uuid', description: 'Đơn hàng; backend thêm từng kiện thuộc đơn vào manifest' })
  @IsUUID('all')
  orderId: string;
}

export class UpdateManifestItemDto {
  @ApiProperty({ enum: [ManifestItemStatus.LOADED, ManifestItemStatus.UNLOADED, ManifestItemStatus.MISSING, ManifestItemStatus.DAMAGED] })
  @IsEnum(ManifestItemStatus)
  status: ManifestItemStatus;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
