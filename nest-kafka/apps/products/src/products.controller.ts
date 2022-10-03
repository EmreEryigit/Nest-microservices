import { microserviceConfig } from "@app/common/microserviceConfig";
import { Controller, Get, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Client, ClientKafka, EventPattern } from "@nestjs/microservices";
import { ProductsService } from "./products.service";

@Controller("/api/products")
export class ProductsController implements OnModuleDestroy {
    constructor(private readonly productsService: ProductsService) {}

    @Client(microserviceConfig("products"))
    client: ClientKafka;

    @Get()
    getHello(): string {
        return this.productsService.getHello();
    }

    @EventPattern("user_created")
    handleUserCreated(data: string) {
        this.productsService.handleUserCreated(data);
    }

    async onModuleDestroy() {
        process.exit(1);
    }
}
