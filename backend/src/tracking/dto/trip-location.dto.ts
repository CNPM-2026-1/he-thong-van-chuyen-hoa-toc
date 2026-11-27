import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateTripLocationDto {
  @ApiProperty({ example: 21.0285, minimum: -90, maximum: 90 })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 105.8542, minimum: -180, maximum: 180 })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 48.5, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  speedKph?: number;

  @ApiPropertyOptional({ example: 135, minimum: 0, maximum: 360 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(360)
  headingDegrees?: number;

  @ApiProperty({ format: 'date-time', example: '2026-12-01T08:31:00Z' })
  @IsDateString()
  recordedAt: string;
}
