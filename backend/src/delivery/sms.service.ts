import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../common/api-exception';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  async send(to: string, message: string) {
    const providerUrl = this.config.get<string>('SMS_PROVIDER_URL');
    const apiKey = this.config.get<string>('SMS_API_KEY');
    const sender = this.config.get<string>('SMS_SENDER', 'HoaToc');

    if (!providerUrl) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        throw ApiException.serviceUnavailable(
          'SMS_PROVIDER_NOT_CONFIGURED',
          'Dịch vụ SMS chưa được cấu hình; không thể gửi OTP',
        );
      }
      // Local development only. Never return OTP to the API caller.
      this.logger.warn(`[DEV OTP] to=${to} message=${message}`);
      return;
    }

    let response: Response;
    try {
      response = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ to, sender, message }),
      });
    } catch {
      throw ApiException.serviceUnavailable('SMS_PROVIDER_UNAVAILABLE', 'Không kết nối được dịch vụ SMS');
    }

    if (!response.ok) {
      throw ApiException.serviceUnavailable('SMS_PROVIDER_ERROR', 'Dịch vụ SMS từ chối gửi OTP');
    }
  }
}
