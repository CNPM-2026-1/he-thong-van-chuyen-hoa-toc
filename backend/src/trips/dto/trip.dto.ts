import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateTripDto {
  @ApiProperty({ example: 'TRIP-HN-HP-001' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{3,40}$/, { message: 'code chỉ gồm chữ in hoa, số và dấu gạch ngang (3-40 ký tự)' })
  code: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all')
  routeId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all')
  vehicleId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all')
  driverId: string;

  @ApiProperty({ format: 'date-time', example: '2026-12-01T08:00:00Z' })
  @IsDateString()
  plannedDepartureAt: string;

  @ApiPropertyOptional({ format: 'date-time', example: '2026-12-01T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  plannedArrivalAt?: string;
}

export class UpdateTripStatusDto {
  @ApiProperty({ enum: TripStatus, enumName: 'TripStatus', example: TripStatus.BOARDING })
  @IsEnum(TripStatus)
  status: TripStatus;

  @ApiPropertyOptional({ maxLength: 500, example: 'Đã hoàn tất kiểm tra trước khi xuất bến' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListTripsQueryDto extends PaginationQueryDto {}
