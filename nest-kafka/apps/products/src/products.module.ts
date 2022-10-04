import { CurrentUserMiddleware } from "@app/common/middlewares/current-user.middleware";
import { MiddlewareConsumer, Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { User } from "./entities/user.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { UsersModule } from "./users/users.module";
import { UsersService } from "./users/users.service";
const cookieSession = require("cookie-session");

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "products-pg-srv",
            port: 5432,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [User, Product],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([User, Product]),
        JwtModule.register({
            secret: process.env.JWT_KEY,
        }),
        UsersModule,
    ],
    controllers: [ProductsController],
    providers: [
        UsersService,
        ProductsService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
            }),
        },
    ],
})
export class ProductsModule {
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
