import { Controller, Get } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ExpirationService } from "./expiration.service";

@Controller()
export class ExpirationController {
    constructor(private readonly expirationService: ExpirationService) {}

    @EventPattern("order_creation_completed_expiration")
    addQueue(@Payload() data: { orderId: string; expiresAt: string }) {
        console.log(data);
        return this.expirationService.process(
            parseInt(data.orderId),
            data.expiresAt
        );
    }
}
