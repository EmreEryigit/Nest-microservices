import { microserviceConfig } from "@app/common/microserviceConfig";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
    imports: [],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
