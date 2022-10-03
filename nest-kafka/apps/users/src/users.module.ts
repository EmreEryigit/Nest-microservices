import { microserviceConfig } from "@app/common/microserviceConfig";
import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

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
export class UsersModule {}
