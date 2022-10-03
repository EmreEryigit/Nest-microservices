import { microserviceConfig } from "@app/common/microserviceConfig";
import { NestFactory } from "@nestjs/core";
import { ProductsModule } from "./products.module";

async function bootstrap() {
    const app = await NestFactory.create(ProductsModule);
    app.connectMicroservice(microserviceConfig("products"));

    await app.startAllMicroservices();
    const micros = app.getMicroservices();
    micros.forEach((micro) => {
        process.on("SIGINT", () => micro.close());
        process.on("SIGTERM", () => micro.close());
    });
    await app.listen(3000);
}
bootstrap();
