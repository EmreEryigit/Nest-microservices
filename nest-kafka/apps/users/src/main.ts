import { microserviceConfig } from "@app/common/microserviceConfig";
import { NestFactory } from "@nestjs/core";
import { UsersModule } from "./users.module";

async function bootstrap() {
    const app = await NestFactory.create(UsersModule);

    app.connectMicroservice(microserviceConfig("users"));
    await app.startAllMicroservices();
    const micros = app.getMicroservices();
    micros.forEach((micro) => {
        process.on("SIGINT", () => micro.close());
        process.on("SIGTERM", () => micro.close());
    });
    await app.listen(3000);
}
bootstrap();
