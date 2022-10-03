import { microserviceConfig } from "@app/common/microserviceConfig";
import { MiddlewareConsumer, Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
const cookieSession = require("cookie-session");

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "users-pg-srv",
            port: 5432,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [User],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        ClientsModule.register([
            {
                name: "PRODUCTS_SERVICE",
                ...microserviceConfig("products"),
            },
        ]),
        JwtModule.register({
            secret: "secret",
        }),
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
            }),
        },
    ],
})
export class UsersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                cookieSession({
                    keys: ["secret"],
                })
            )
            .forRoutes("*");
    }
}
