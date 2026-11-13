import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { VehicleStatus, VehicleType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, Matches, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ToBoolean } from '../../common/utils';

export class VehicleInputDto {
  @ApiProperty({ example: '29H-123.45' })
  @Matches(/^[0-9]{2}[A-Z]{1,2}[0-9]?-[0-9]{3}\.?[0-9]{2}$/, { message: 'plateNumber không đúng định dạng (vd 29H-123.45)' })
  plateNumber: string;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType, { message: 'vehicleType phải là VAN, TRUCK hoặc BUS' })
  vehicleType: VehicleType;

  @ApiProperty({ example: 1500 })
  @IsNumber({}, { message: 'capacityKg phải là số' })
  @Min(0)
  capacityKg: number;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber({}, { message: 'capacityVolumeM3 phải là số' })
  @Min(0)
  capacityVolumeM3?: number;

  @ApiPropertyOptional({ enum: VehicleStatus, default: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVehicleDto extends PartialType(VehicleInputDto) {}

export class ListVehiclesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
