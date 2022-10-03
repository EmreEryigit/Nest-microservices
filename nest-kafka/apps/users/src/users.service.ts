import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes, scrypt } from "crypto";
import { Repository } from "typeorm";
import { promisify } from "util";
import { CreateUserDto } from "./dtos/create-user.dto";
import { SigninDto } from "./dtos/signin.dto";
import { User } from "./user.entity";

const Ascrypt = promisify(scrypt);

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        @Inject("PRODUCTS_SERVICE") private readonly productClient: ClientKafka
    ) {}

    getHello(): string {
        return "Hello World!";
    }

    async signup(dto: CreateUserDto) {
        const { email, password } = dto;
        const foundUser = await this.repo.findOneBy({ email });
        if (foundUser) {
            throw new BadRequestException("Email already in use");
        }
        const salt = randomBytes(8).toString("hex");
        const hash = (await Ascrypt(password, salt, 32)) as Buffer;
        const result = salt + "." + hash.toString("hex");
        console.log(result);
        const user = this.repo.create({
            email,
            password: result,
        });
        console.log(user);
        await this.repo.save(user);
        this.productClient.emit("user_created", user.email);
        return user;
    }

    async signin(dto: SigninDto) {
        const { email, password } = dto;
        const foundUser = await this.repo.findOneBy({ email });
        if (!foundUser) {
            throw new BadRequestException("User does not exist");
        }
        const [salt, storedHash] = foundUser.password.split(".");

        const hash = (await Ascrypt(password, salt, 32)) as Buffer;
        const isValidPassword = storedHash === hash.toString("hex");

        if (!isValidPassword) {
            throw new BadRequestException("Invalid email or password");
        }

        return foundUser;
    }
}
