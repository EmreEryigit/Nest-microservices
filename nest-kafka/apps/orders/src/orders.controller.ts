import { CurrentUser } from "@app/common/decorators/current-user.decorator";
import { Patterns } from "@app/common/events/event-patterns";
import { AuthGuard } from "@app/common/guards/auth.guard";
import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import {
    Controller,
    Delete,
    Get,
    Inject,
    OnModuleDestroy,
    OnModuleInit,
    Param,
    Patch,
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
    @Post("/:productId")
    createOrder(
        @Param("productId") productId: string,
        @CurrentUser() user: UserPayload
    ) {
        return this.ordersService.createOrder(parseInt(productId), user.id);
    }

    @UseGuards(AuthGuard)
    @Patch("/:orderId")
    cancelOrder(
        @Param("orderId") orderId: string,
        @CurrentUser() user: UserPayload
    ) {
        return this.ordersService.cancelOrder(parseInt(orderId), user.id);
    }

    async onModuleInit() {
        this.productClient.subscribeToResponseOf("order_created");
        await this.productClient.connect();
        process.on("SIGINT", () => this.productClient.close());
        process.on("SIGTERM", () => this.productClient.close());
    }
    onModuleDestroy() {
        process.exit(1);
    }
}
