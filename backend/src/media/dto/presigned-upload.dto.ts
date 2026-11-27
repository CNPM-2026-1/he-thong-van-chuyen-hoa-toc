import { ApiProperty } from '@nestjs/swagger';
import { MediaPurpose } from '@prisma/client';
import { IsEnum, IsIn, IsString, MaxLength } from 'class-validator';

export class PresignedUploadDto {
  @ApiProperty({ example: 'delivery-proof.jpg', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ enum: ['image/jpeg', 'image/png', 'application/pdf'] })
  @IsIn(['image/jpeg', 'image/png', 'application/pdf'])
  contentType: string;

  @ApiProperty({ enum: MediaPurpose })
  @IsEnum(MediaPurpose)
  purpose: MediaPurpose;
}
