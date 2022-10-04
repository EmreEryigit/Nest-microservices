import { OrderCreatedPayload } from "@app/common/events/order-created.event";
import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dtos/create-product.dto";
import { Product } from "./entities/product.entity";
import { UsersService } from "./users/users.service";

@Injectable()
export class ProductsService {
    constructor(
        private readonly usersService: UsersService,
        @InjectRepository(Product) private repo: Repository<Product>
    ) {}
    getHello(): string {
        return "Hello World!";
    }

    handleUserCreated(data: string) {
        console.log(data);
    }
    async findWithOwner(id: number) {
        return await this.repo.findOne({
            where: { id },
            relations: {
                owner: true,
            },
        });
    }

    async createProduct(product: CreateProductDto, userId: number) {
        const newProduct = await this.repo.create(product);
        const foundUser = await this.usersService.findUser(userId);
        const isDuplicate = foundUser.products.find(
            (product) =>
                product.brand.toLowerCase() ===
                    newProduct.brand.toLowerCase() &&
                product.model.toLowerCase() === newProduct.model.toLowerCase()
        );
        if (isDuplicate) {
            throw new BadRequestException("item already on sale by you");
        }
        newProduct.owner = foundUser;
        await this.repo.save(newProduct);
        return newProduct;
    }

    async updateProduct(
        id: number,
        body: Partial<CreateProductDto>,
        user: UserPayload
    ) {
        const foundProduct = await this.findWithOwner(id);
        const isOwner = foundProduct.owner.id === user.id;
        if (!isOwner) {
            throw new UnauthorizedException();
        }
        Object.assign(foundProduct, body);
        return await this.repo.save(foundProduct);
    }

    findProduct(id: number) {
        return this.findWithOwner(id);
    }
    findAllProducts() {
        return this.repo.find({
            relations: {
                owner: true,
            },
        });
    }

    async handleOrderCreated(payload: OrderCreatedPayload) {
        console.log("PRODUCTS SERVICE");
        const product = await this.findWithOwner(payload.productId);
        const isOwner = product.owner.id === payload.userId;
        if (isOwner) {
            throw new BadRequestException();
        }
        if (product.orderId) {
            throw new BadRequestException("Not available");
        }

        return {
            product: {
                brand: product.brand,
                model: product.model,
                price: product.price,
            },
        };
    }
}
