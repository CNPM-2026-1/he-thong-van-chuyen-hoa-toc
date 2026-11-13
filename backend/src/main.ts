import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { buildValidationPipe } from './common/validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  const origins = config.get<string>('CORS_ORIGINS', '*');
  app.enableCors({ origin: origins === '*' ? true : origins.split(',').map((o) => o.trim()) });
  app.useGlobalPipes(buildValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hệ thống vận chuyển hỏa tốc - API')
    .setDescription('Sprint 1: xác thực, tài khoản và danh mục. Bấm "Authorize" và dán accessToken để gọi API cần đăng nhập.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, { swaggerOptions: { persistAuthorization: true } });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`API:     http://localhost:${port}/api/v1`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
