import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID, createHmac, createHash } from 'crypto';
import { ApiException } from '../common/api-exception';
import { IdempotencyService } from '../common/idempotency.service';
import { PrismaService } from '../prisma/prisma.service';
import { PresignedUploadDto } from './dto/presigned-upload.dto';

function encodeRFC3986(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value, 'utf8').digest();
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly config: ConfigService,
  ) {}

  async createPresignedUpload(
    dto: PresignedUploadDto,
    userId: string,
    idempotencyKey: string | undefined,
  ) {
    const endpointValue = this.config.get<string>('S3_ENDPOINT');
    const bucket = this.config.get<string>('S3_BUCKET');
    const accessKey = this.config.get<string>('S3_ACCESS_KEY_ID');
    const secretKey = this.config.get<string>('S3_SECRET_ACCESS_KEY');
    const region = this.config.get<string>('S3_REGION', 'us-east-1');

    if (!endpointValue || !bucket || !accessKey || !secretKey) {
      throw ApiException.serviceUnavailable(
        'OBJECT_STORAGE_NOT_CONFIGURED',
        'Object storage chưa được cấu hình; kiểm tra S3_ENDPOINT, S3_BUCKET và credentials',
      );
    }

    const safeFileName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
    const extension = this.extensionFor(dto.contentType, safeFileName);
    const now = new Date();
    const expiresInSeconds = 300;
    const prefix =
      dto.purpose === 'DELIVERY_PROOF'
        ? 'delivery-proof'
        : dto.purpose === 'INCIDENT_EVIDENCE'
          ? 'incident-evidence'
          : 'other';
    const objectKey = `${prefix}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${extension}`;

    return this.idempotency.execute(
      userId,
      'POST:/media/presigned-uploads',
      idempotencyKey,
      dto,
      async (tx) => {
        const uploadUrl = this.signPutUrl({
          endpointValue,
          bucket,
          objectKey,
          contentType: dto.contentType,
          accessKey,
          secretKey,
          region,
          expiresInSeconds,
          now,
        });

        const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
        await tx.mediaObject.create({
          data: {
            objectKey,
            fileName: safeFileName,
            contentType: dto.contentType,
            purpose: dto.purpose,
            uploadedById: userId,
            expiresAt,
          },
        });

        return {
          uploadUrl,
          objectKey,
          expiresInSeconds,
          requiredHeaders: { 'Content-Type': dto.contentType },
        };
      },
    );
  }

  private signPutUrl(input: {
    endpointValue: string;
    bucket: string;
    objectKey: string;
    contentType: string;
    accessKey: string;
    secretKey: string;
    region: string;
    expiresInSeconds: number;
    now: Date;
  }) {
    const endpoint = new URL(input.endpointValue);
    if (endpoint.search || endpoint.hash) {
      throw ApiException.badRequest('INVALID_STORAGE_ENDPOINT', 'S3_ENDPOINT không được chứa query hoặc hash');
    }

    const amzDate = input.now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const scope = `${dateStamp}/${input.region}/s3/aws4_request`;
    const basePath = endpoint.pathname.replace(/\/$/, '');
    const canonicalUri = `${basePath}/${encodeRFC3986(input.bucket)}/${input.objectKey
      .split('/')
      .map(encodeRFC3986)
      .join('/')}`;

    const params: Array<[string, string]> = [
      ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
      ['X-Amz-Credential', `${input.accessKey}/${scope}`],
      ['X-Amz-Date', amzDate],
      ['X-Amz-Expires', String(input.expiresInSeconds)],
      ['X-Amz-SignedHeaders', 'content-type;host'],
    ];
    const canonicalQuery = params
      .map(([key, value]) => [encodeRFC3986(key), encodeRFC3986(value)] as const)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const signedHeaders = 'content-type;host';
    const canonicalHeaders = `content-type:${input.contentType.trim()}\nhost:${endpoint.host}\n`;
    const canonicalRequest = [
      'PUT',
      canonicalUri,
      canonicalQuery,
      canonicalHeaders,
      signedHeaders,
      'UNSIGNED-PAYLOAD',
    ].join('\n');
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      scope,
      createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const dateKey = hmac(`AWS4${input.secretKey}`, dateStamp);
    const regionKey = hmac(dateKey, input.region);
    const serviceKey = hmac(regionKey, 's3');
    const signingKey = hmac(serviceKey, 'aws4_request');
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    return `${endpoint.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
  }

  private extensionFor(contentType: string, fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (contentType === 'image/jpeg') return 'jpg';
    if (contentType === 'image/png') return 'png';
    if (contentType === 'application/pdf') return 'pdf';
    return ext || 'bin';
  }
}
