import { NestFactory } from '@nestjs/core';
import { ExpirationModule } from './expiration.module';

async function bootstrap() {
  const app = await NestFactory.create(ExpirationModule);
  await app.listen(3000);
}
bootstrap();
