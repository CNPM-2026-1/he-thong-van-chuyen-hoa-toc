import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { MediaService } from './media.service';
import { PresignedUploadDto } from './dto/presigned-upload.dto';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('presigned-uploads')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiOperation({ summary: 'Cấp URL upload ảnh/chứng từ lên object storage' })
  createPresignedUpload(
    @Body() dto: PresignedUploadDto,
    @CurrentUser() user: User,
    @Headers('Idempotency-Key') key?: string,
  ) {
    return this.media.createPresignedUpload(dto, user.id, key);
  }
}
