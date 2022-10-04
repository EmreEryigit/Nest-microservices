import { CurrentUser } from "@app/common/decorators/current-user.decorator";
import { Patterns } from "@app/common/events/event-patterns";
import { AuthGuard } from "@app/common/guards/auth.guard";
import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import {
    Controller,
    Get,
    Inject,
    OnModuleDestroy,
    OnModuleInit,
    Param,
    Post,
    UseGuards,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { OrdersService } from "./orders.service";

@Controller("/api/orders")
export class OrdersController implements OnModuleDestroy, OnModuleInit {
    constructor(
        private readonly ordersService: OrdersService,
        @Inject("PRODUCTS_SERVICE") private readonly productClient: ClientKafka
    ) {}

    @UseGuards(AuthGuard)
    @Get()
    getHello(@CurrentUser() user: UserPayload): string {
        console.log(user);
        return this.ordersService.getHello();
    }
    @UseGuards(AuthGuard)
    @Post("/:productId")
    createOrder(@Param("id") id: string, @CurrentUser() user: UserPayload) {
        return this.ordersService.createOrder(parseInt(id), user.id);
    }

    async onModuleInit() {
        this.productClient.subscribeToResponseOf("order_created");
        await this.productClient.connect();
        /* process.on("SIGINT", () => this.productClient.close());
        process.on("SIGTERM", () => this.productClient.close()); */
    }
    onModuleDestroy() {
        this.productClient.close();
        process.exit(1);
    }
}
