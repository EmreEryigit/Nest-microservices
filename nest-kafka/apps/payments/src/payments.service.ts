import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import { OrderStatus } from "@app/common/types/OrderStatus";
import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePaymentDto } from "./dtos/create-payment.dto";
import { Order } from "./entities/order.entity";
import { Payment } from "./entities/Payment.entity";
import { stripe } from "./stripe";

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @Inject("ORDERS_SERVICE") private readonly orderClient: ClientKafka
    ) {}
    getHello(): string {
        return "Hello World!";
    }

    async handleOrderCreation(orderId: number, price: number, userId: number) {
        const order = this.orderRepo.create({
            userId,
            price,
            id: orderId,
            status: OrderStatus.Created,
        });
        await this.orderRepo.save(order);
    }

    async handleCreatePayment(body: CreatePaymentDto, user: UserPayload) {
        const order = await this.orderRepo.findOneBy({
            id: parseInt(body.orderId),
        });
        if (!order) {
            throw new BadRequestException("order not found");
        }
        if (order.userId !== user.id) {
            throw new UnauthorizedException();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestException("Order cancelled already");
        }
        const charge = await stripe.charges.create({
            amount: order.price * 100,
            currency: "usd",
            source: body.token,
        });
        const payment = this.paymentRepo.create({
            orderId: order.id,
            stripeId: charge.id,
        });
        await this.paymentRepo.save(payment);
        this.orderClient.emit("payment_created", order.id);
        return payment;
    }
}
