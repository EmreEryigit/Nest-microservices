import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpirationService {
  getHello(): string {
    return 'Hello World!';
  }
}
