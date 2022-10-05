import { microserviceConfig } from "@app/common/microserviceConfig";
import { NestFactory } from "@nestjs/core";
import { PaymentsModule } from "./payments.module";

async function bootstrap() {
    const app = await NestFactory.create(PaymentsModule);
    app.connectMicroservice(microserviceConfig("payments"));

    await app.startAllMicroservices();

    const micros = app.getMicroservices();
    micros.forEach((micro) => {
        process.on("SIGINT", () => micro.close());
        process.on("SIGTERM", () => micro.close());
    });
    await app.listen(3000);
}
bootstrap();
