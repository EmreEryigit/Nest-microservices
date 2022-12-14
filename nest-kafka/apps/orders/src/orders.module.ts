import { microserviceConfig } from "@app/common/microserviceConfig";
import { CurrentUserMiddleware } from "@app/common/middlewares/current-user.middleware";
import { MiddlewareConsumer, Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ClientsModule } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Product } from "./entities/product.entity";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { ProductsService } from "./products.service";
const cookieSession = require("cookie-session");

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "orders-pg-srv",
            port: 5432,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [Order, Product],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([Order, Product]),
        ClientsModule.register([
            {
                name: "PRODUCTS_SERVICE",
                ...microserviceConfig("products"),
            },
            {
                name: "PAYMENTS_SERVICE",
                ...microserviceConfig("payments"),
            },
            {
                name: "EXPIRATION_SERVICE",
                ...microserviceConfig("expiration"),
            },
        ]),
        JwtModule.register({
            secret: process.env.JWT_KEY,
        }),
    ],
    controllers: [OrdersController],
    providers: [
        OrdersService,
        ProductsService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
            }),
        },
    ],
})
export class OrdersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                cookieSession({
                    keys: ["secret"],
                })
            )
            .forRoutes("*");

        // session must be before the middleware
        consumer.apply(CurrentUserMiddleware).forRoutes("*");
    }
}
