import { CurrentUser } from "@app/common/decorators/current-user.decorator";
import { AuthGuard } from "@app/common/guards/auth.guard";
import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import {
    Controller,
    Inject,
    OnModuleDestroy,
    OnModuleInit,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { ClientKafka, EventPattern, Payload } from "@nestjs/microservices";
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

    @EventPattern("payment_created")
    handlePaymentCreated(@Payload() orderId: string) {
        return this.ordersService.paymentComplete(parseInt(orderId));
    }

    @EventPattern("expiration_completed")
    expirationCompleted(orderId: string) {
        return this.ordersService.orderExpired(parseInt(orderId));
    }

    async onModuleInit() {
        this.productClient.subscribeToResponseOf("order_created");
        await this.productClient.connect();
        process.on("SIGINT", () => this.productClient.close());
        process.on("SIGTERM", () => this.productClient.close());
    }
    async onModuleDestroy() {
        await this.productClient.close();
        process.exit(0);
    }
}
