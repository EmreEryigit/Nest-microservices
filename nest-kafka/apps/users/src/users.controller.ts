import { Serialize } from "@app/common/interceptors/serialize.interceptor";
import { microserviceConfig } from "@app/common/microserviceConfig";
import {
    Body,
    Controller,
    Get,
    OnModuleDestroy,
    OnModuleInit,
    Post,
    Session,
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
    async signup(@Body() body: CreateUserDto, @Session() session: any) {
        const { user, userJwt } = await this.usersService.signup(body);
        session.user = userJwt;
        return user;
    }

    @Post("/signin")
    async signin(@Body() body: SigninDto, @Session() session: any) {
        const { user, userJwt } = await this.usersService.signin(body);
        session.user = userJwt;
        return user;
    }

    async onModuleDestroy() {
        process.exit(1);
    }
}
