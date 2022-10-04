import { Test, TestingModule } from '@nestjs/testing';
import { ExpirationController } from './expiration.controller';
import { ExpirationService } from './expiration.service';

describe('ExpirationController', () => {
  let expirationController: ExpirationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExpirationController],
      providers: [ExpirationService],
    }).compile();

    expirationController = app.get<ExpirationController>(ExpirationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(expirationController.getHello()).toBe('Hello World!');
    });
  });
});
