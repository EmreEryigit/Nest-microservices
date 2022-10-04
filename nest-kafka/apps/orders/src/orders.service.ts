import { OrderStatus } from "@app/common/types/OrderStatus";
import {
    BadGatewayException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { Product } from "./entities/product.entity";
import { ProductsService } from "./products.service";

const EXPIRATION_WINDOW_SECONDS = 60 * 0.5;

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly repo: Repository<Order>,
        @Inject("PRODUCTS_SERVICE") private readonly productClient: ClientKafka,
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
                    this.productClient.emit("order_creation_completed", {
                        orderId: order.id,
                        productId,
                    });
                    return order;
                });
        };
        return await sendAndCreate();
    }

    async cancelOrder(orderId: number, userId: number) {
        const order = await this.findWithProduct(orderId);
        console.log(order);

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
}
