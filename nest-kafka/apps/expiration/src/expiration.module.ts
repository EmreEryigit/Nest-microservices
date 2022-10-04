import { Module } from '@nestjs/common';
import { ExpirationController } from './expiration.controller';
import { ExpirationService } from './expiration.service';

@Module({
  imports: [],
  controllers: [ExpirationController],
  providers: [ExpirationService],
})
export class ExpirationModule {}
