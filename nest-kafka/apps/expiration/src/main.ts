import { microserviceConfig } from "@app/common/microserviceConfig";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions } from "@nestjs/microservices";
import { ExpirationModule } from "./expiration.module";

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        ExpirationModule,
        microserviceConfig("expiration")
    );

    app.listen();
}
bootstrap();
