import { Controller, Get } from '@nestjs/common';
import { ExpirationService } from './expiration.service';

@Controller()
export class ExpirationController {
  constructor(private readonly expirationService: ExpirationService) {}

  @Get()
  getHello(): string {
    return this.expirationService.getHello();
  }
}
