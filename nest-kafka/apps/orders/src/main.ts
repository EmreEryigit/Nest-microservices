import { microserviceConfig } from "@app/common/microserviceConfig";
import { NestFactory } from "@nestjs/core";
import { OrdersModule } from "./orders.module";

async function bootstrap() {
    const app = await NestFactory.create(OrdersModule);
    app.connectMicroservice(microserviceConfig("orders"));

    await app.startAllMicroservices();

    const micros = app.getMicroservices();
    micros.forEach((micro) => {
        process.on("SIGINT", () => micro.close());
        process.on("SIGTERM", () => micro.close());
    });

    await app.listen(3000);
}

bootstrap();
