import { OrderStatus } from "@app/common/types/OrderStatus";
import {
    BadGatewayException,
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { ProductsService } from "./products.service";

const EXPIRATION_WINDOW_SECONDS = 60 * 0.5;

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly repo: Repository<Order>,
        @Inject("PRODUCTS_SERVICE") private readonly productClient: ClientKafka,
        @Inject("PAYMENTS_SERVICE") private readonly paymentClient: ClientKafka,
        @Inject("EXPIRATION_SERVICE")
        private readonly expirationClient: ClientKafka,
        private readonly productsService: ProductsService
    ) {}

    async findWithProduct(id: number) {
        return await this.repo.findOne({
            where: { id },
            relations: {
                product: true,
            },
        });
    }

    async createOrder(productId: number, userId: number) {
        const sendAndCreate = async () => {
            this.productClient
                .send("order_created", { productId, userId })
                .subscribe(async (prod) => {
                    try {
                        if (!prod[0]) {
                            throw new BadRequestException();
                        }
                        const product = await this.productsService.create(
                            JSON.parse(prod[0])
                        );
                        if (!product) {
                            throw new BadGatewayException("KAFKA consumer");
                        }
                        const expiration = new Date();
                        expiration.setSeconds(
                            expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS
                        );
                        const order = this.repo.create({
                            product: product,
                            userId: userId,
                            expiresAt: expiration,
                        });
                        await this.repo.save(order);
                        this.productClient.emit(
                            "order_creation_completed_products",
                            {
                                orderId: order.id,
                                productId,
                            }
                        );
                        this.paymentClient.emit(
                            "order_creation_completed_payments",
                            {
                                orderId: order.id,
                                price: order.product.price,
                                userId: order.userId,
                            }
                        );
                        this.expirationClient.emit(
                            "order_creation_completed_expiration",
                            { orderId: order.id, expiresAt: order.expiresAt }
                        );
                        return order;
                    } catch (err) {
                        return err.response;
                    }
                });
        };

        await sendAndCreate();
    }
    async cancelOrder(orderId: number, userId: number) {
        const order = await this.findWithProduct(orderId);

        if (!order) {
            throw new NotFoundException("Order does not exist");
        }
        if (order.userId !== userId) {
            throw new UnauthorizedException();
        }
        order.status = OrderStatus.Cancelled;
        await this.repo.save(order);
        this.productClient.emit("order_cancelled", order.product.id);
        return order;
    }

    async paymentReceived(orderId: number) {
        const order = await this.findWithProduct(orderId);
        if (!order) {
            throw new NotFoundException("Order does not exist");
        }
        order.status = OrderStatus.AwaitingPayment;
        await this.repo.save(order);
        return order;
    }

    async paymentComplete(orderId: number) {
        const order = await this.findWithProduct(orderId);
        if (!order) {
            throw new NotFoundException("Order does not exist");
        }
        order.status = OrderStatus.Complete;
        await this.repo.save(order);
        return order;
    }
    async orderExpired(orderId: number) {
        const order = await this.findWithProduct(orderId);
        if (!order) {
            throw new BadRequestException();
        }

        if (order.status === OrderStatus.Complete) {
            throw new BadRequestException("Order completed");
        }

        order.status = OrderStatus.Cancelled;
        await this.repo.save(order);
        this.productClient.emit("order_cancelled", order.product.id);
        return order;
    }
}
