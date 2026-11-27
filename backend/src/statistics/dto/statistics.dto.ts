import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DateRangeQueryDto {
  @ApiProperty({ format: 'date', example: '2026-11-01' })
  @IsDateString()
  from: string;

  @ApiProperty({ format: 'date', example: '2026-11-30' })
  @IsDateString()
  to: string;
}
