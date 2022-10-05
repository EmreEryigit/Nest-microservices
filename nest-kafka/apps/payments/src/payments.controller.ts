import { CurrentUser } from "@app/common/decorators/current-user.decorator";
import { AuthGuard } from "@app/common/guards/auth.guard";
import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { CreatePaymentDto } from "./dtos/create-payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("api/payments")
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Get()
    getHello(): string {
        return this.paymentsService.getHello();
    }
    @UseGuards(AuthGuard)
    @Post()
    createPayment(
        @Body() body: CreatePaymentDto,
        @CurrentUser() user: UserPayload
    ) {
        return this.paymentsService.handleCreatePayment(body, user);
    }

    @EventPattern("order_creation_completed_payments")
    handleOrderCreation(
        @Payload()
        {
            orderId,
            price,
            userId,
        }: {
            orderId: string;
            price: string;
            userId: string;
        }
    ) {
        return this.paymentsService.handleOrderCreation(
            parseInt(orderId),
            parseInt(price),
            parseInt(userId)
        );
    }
}
