import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StationType } from '@prisma/client';
import { IsBoolean, IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ToBoolean } from '../../common/utils';

export class StationInputDto {
  @ApiProperty({ example: 'HN-01' })
  @Matches(/^[A-Z0-9-]{2,20}$/, { message: 'code chỉ gồm chữ in hoa, số, dấu gạch ngang (2-20 ký tự)' })
  code: string;

  @ApiProperty({ example: 'Ben xe My Dinh' })
  @IsString()
  @IsNotEmpty({ message: 'name không được để trống' })
  @MaxLength(150)
  name: string;

  @ApiProperty({ enum: StationType })
  @IsEnum(StationType, { message: 'type phải là BUS_STATION, WAREHOUSE hoặc OFFICE' })
  type: StationType;

  @ApiProperty({ example: '20 Pham Hung, Nam Tu Liem, Ha Noi' })
  @IsString()
  @IsNotEmpty({ message: 'address không được để trống' })
  address: string;

  @ApiProperty({ example: 'Ha Noi' })
  @IsString()
  @IsNotEmpty({ message: 'province không được để trống' })
  province: string;

  @ApiPropertyOptional({ example: 21.0285 })
  @IsOptional()
  @IsLatitude({ message: 'latitude không hợp lệ' })
  latitude?: number;

  @ApiPropertyOptional({ example: 105.7823 })
  @IsOptional()
  @IsLongitude({ message: 'longitude không hợp lệ' })
  longitude?: number;

  @ApiPropertyOptional({ example: '02437685549' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStationDto extends PartialType(StationInputDto) {}

export class ListStationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: StationType })
  @IsOptional()
  @IsEnum(StationType)
  type?: StationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
