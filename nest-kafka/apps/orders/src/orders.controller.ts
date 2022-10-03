import { Controller, Get, OnModuleDestroy } from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("/api/orders")
export class OrdersController implements OnModuleDestroy {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    getHello(): string {
        return this.ordersService.getHello();
    }

    async onModuleDestroy() {
        process.exit(1);
    }
}
