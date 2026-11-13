import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Matches, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ToBoolean } from '../../common/utils';

export class RouteInputDto {
  @ApiProperty({ example: 'HN-HP' })
  @Matches(/^[A-Z0-9-]{2,20}$/, { message: 'code chỉ gồm chữ in hoa, số, dấu gạch ngang (2-20 ký tự)' })
  code: string;

  @ApiProperty({ example: 'Ha Noi - Hai Phong' })
  @IsString()
  @IsNotEmpty({ message: 'name không được để trống' })
  @MaxLength(150)
  name: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: 'originStationId không hợp lệ' })
  originStationId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: 'destinationStationId không hợp lệ' })
  destinationStationId: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber({}, { message: 'distanceKm phải là số' })
  @Min(0)
  distanceKm?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsInt({ message: 'estimatedDurationMinutes phải là số nguyên' })
  @Min(1)
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRouteDto extends PartialType(RouteInputDto) {}

export class ListRoutesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  originStationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  destinationStationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
