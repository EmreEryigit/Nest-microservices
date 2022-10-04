import { Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly repo: Repository<Order>,
        @Inject("PRODUCTS_SERVICE") private readonly productClient: ClientKafka
    ) {}
    getHello(): string {
        return "Hello World!";
    }

    async createOrder(productId: number, userId: number) {
        console.log("ORDER SERVICE");
        this.productClient
            .send("order_created", { productId, userId })
            .subscribe((value) => {
                console.log({ ...value });
            });
    }
}
