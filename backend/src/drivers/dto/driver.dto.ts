import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ToBoolean } from '../../common/utils';

export class DriverInputDto {
  @ApiProperty({ format: 'uuid', description: 'Tài khoản có role DRIVER (tạo qua POST /users)' })
  @IsUUID('all', { message: 'userId không hợp lệ' })
  userId: string;

  @ApiProperty({ example: 'B2-123456' })
  @IsString()
  @IsNotEmpty({ message: 'licenseNumber không được để trống' })
  @MaxLength(30)
  licenseNumber: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true, description: 'Xe mặc định; gửi null để bỏ gán' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUUID('all', { message: 'defaultVehicleId không hợp lệ' })
  defaultVehicleId?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/** Không cho đổi userId sau khi tạo hồ sơ tài xế. */
export class UpdateDriverDto extends PartialType(OmitType(DriverInputDto, ['userId'] as const)) {}

export class ListDriversQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
