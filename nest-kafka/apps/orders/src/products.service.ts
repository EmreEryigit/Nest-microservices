import { OrderStatus } from "@app/common/types/OrderStatus";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dtos/create-product.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private readonly repo: Repository<Product>
    ) {}

    async create(body: CreateProductDto) {
        const product = this.repo.create(body);
        await this.repo.save(product);
        return product;
    }

    /* async findProductOrders(productId: number) {
        const product = await this.repo.findOne({
            where: {
                id: productId,
            },
            relations: {
                orders: true,
            },
        });
        const isOrder = product.orders?.map(order => order.status ===  OrderStatus.)

    } */
}
