import { microserviceConfig } from "@app/common/microserviceConfig";
import { CurrentUserMiddleware } from "@app/common/middlewares/current-user.middleware";
import { MiddlewareConsumer, Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ClientsModule } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Payment } from "./entities/Payment.entity";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
const cookieSession = require("cookie-session");

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "payments-pg-srv",
            port: 5432,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [Payment, Order],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([Order, Payment]),
        JwtModule.register({
            secret: process.env.JWT_KEY,
        }),
        ClientsModule.register([
            {
                name: 'ORDERS_SERVICE',
                ...microserviceConfig('orders')
            }
        ])
    ],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({ whitelist: true }),
        },
    ],
})
export class PaymentsModule {
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
