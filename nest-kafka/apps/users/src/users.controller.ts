import { Serialize } from "@app/common/interceptors/serialize.interceptor";
import { microserviceConfig } from "@app/common/microserviceConfig";
import {
    Body,
    Controller,
    Get,
    OnModuleDestroy,
    OnModuleInit,
    Post,
} from "@nestjs/common";
import { Client, ClientKafka } from "@nestjs/microservices";
import { CreateUserDto } from "./dtos/create-user.dto";
import { SigninDto } from "./dtos/signin.dto";
import { UserDto } from "./dtos/user.dto";
import { UsersService } from "./users.service";

@Serialize(UserDto)
@Controller("api/users")
export class UsersController implements OnModuleDestroy {
    constructor(private readonly usersService: UsersService) {}
    @Client(microserviceConfig("users"))
    client: ClientKafka;

    @Get()
    getHello(): string {
        return this.usersService.getHello();
    }

    @Post("/signup")
    signup(@Body() body: CreateUserDto) {
        return this.usersService.signup(body);
    }

    @Post("/signin")
    signin(@Body() body: SigninDto) {
        return this.usersService.signin(body);
    }

    async onModuleDestroy() {
        process.exit(1);
    }
}
