import { CurrentUser } from "@app/common/decorators/current-user.decorator";
import { AuthGuard } from "@app/common/guards/auth.guard";
import { Serialize } from "@app/common/interceptors/serialize.interceptor";
import { microserviceConfig } from "@app/common/microserviceConfig";
import {
    Body,
    Controller,
    Get,
    OnModuleDestroy,
    Post,
    Session,
    UseGuards,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { SigninDto } from "./dtos/signin.dto";
import { UserDto } from "./dtos/user.dto";
import { UsersService } from "./users.service";

@Serialize(UserDto)
@Controller("api/users")
export class UsersController implements OnModuleDestroy {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getHello(): string {
        return this.usersService.getHello();
    }

    @Post("/signup")
    async signup(@Body() body: CreateUserDto, @Session() session: any) {
        const { user, userJwt } = await this.usersService.signup(body);
        session.jwt = userJwt;
        return user;
    }

    @Post("/signin")
    async signin(@Body() body: SigninDto, @Session() session: any) {
        const { user, userJwt } = await this.usersService.signin(body);
        session.jwt = userJwt;
        return user;
    }

    @UseGuards(AuthGuard)
    @Post("/signout")
    async signout(@Session() session: any) {
        return (session.jwt = null);
    }

    @UseGuards(AuthGuard)
    @Get("/whoami")
    whoAmI(@CurrentUser() user: any) {
        return user;
    }

    async onModuleDestroy() {
        process.exit(1);
    }
}
