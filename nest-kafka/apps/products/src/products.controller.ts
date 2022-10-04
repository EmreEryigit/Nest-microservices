import { CurrentUser } from "@app/common/decorators/current-user.decorator";
import { OrderCreatedPayload } from "@app/common/events/order-created.event";
import { AuthGuard } from "@app/common/guards/auth.guard";
import { Serialize } from "@app/common/interceptors/serialize.interceptor";
import { microserviceConfig } from "@app/common/microserviceConfig";
import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import {
    Body,
    Controller,
    Get,
    OnModuleDestroy,
    OnModuleInit,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import {
    Client,
    ClientKafka,
    EventPattern,
    MessagePattern,
    Payload,
} from "@nestjs/microservices";
import { CreateProductDto } from "./dtos/create-product.dto";
import { ProductDto } from "./dtos/product.dto";
import { ProductsService } from "./products.service";
import { UsersService } from "./users/users.service";

@Serialize(ProductDto)
@Controller("/api/products")
export class ProductsController implements OnModuleDestroy {
    constructor(
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService
    ) {}

    @UseGuards(AuthGuard)
    @Get("/whoami")
    whoAmI(@CurrentUser() user: UserPayload) {
        return user;
    }

    @UseGuards(AuthGuard)
    @Post()
    async createProduct(
        @Body() createProductDto: CreateProductDto,
        @CurrentUser() user: UserPayload
    ) {
        await this.usersService.createUser(user);
        return this.productsService.createProduct(createProductDto, user.id);
    }

    @UseGuards(AuthGuard)
    @Patch("/:id")
    updateProduct(
        @Param("id") id: string,
        @Body() body: Partial<CreateProductDto>,
        @CurrentUser() user: UserPayload
    ) {
        return this.productsService.updateProduct(parseInt(id), body, user);
    }

    @Get("/:id")
    getProduct(@Param("id") id: string) {
        return this.productsService.findProduct(parseInt(id));
    }

    @Get()
    getAllProducts() {
        return this.productsService.findAllProducts();
    }

    // KAFKA

    /*    @EventPattern("order_created")
    completeCreated(@Payload() payload: OrderCreatedPayload) {
        return console.log(payload);
    } */

    @MessagePattern("order_created")
    handleOrderCreated(@Payload() payload: OrderCreatedPayload) {
        console.log("PRODUCT CONTROLLER");
        return this.productsService.handleOrderCreated(payload);
    }

    @EventPattern("order_creation_completed")
    completeOrder(@Payload() data: { orderId: string; productId: string }) {
        return this.productsService.handleOrderCreationCompleted(
            parseInt(data.orderId),
            parseInt(data.productId)
        );
    }

    @EventPattern("order_cancelled")
    cancelOrder(@Payload() productId: string) {
        console.log(productId);
        return this.productsService.cancelOrder(parseInt(productId));
    }

    async onModuleDestroy() {
        process.exit(1);
    }
}
