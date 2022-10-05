import { microserviceConfig } from "@app/common/microserviceConfig";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { ExpirationController } from "./expiration.controller";
import { ExpirationService } from "./expiration.service";
import { OrderProcessor } from "./order.processor";

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST,
            },
        }),
        BullModule.registerQueue({
            name: "order",
            redis: {
                host: process.env.REDIS_HOST,
            },
        }),
        ClientsModule.register([
            {
                name: "ORDERS_SERVICE",
                ...microserviceConfig("orders"),
            },
        ]),
    ],
    controllers: [ExpirationController],
    providers: [ExpirationService, OrderProcessor],
})
export class ExpirationModule {}
