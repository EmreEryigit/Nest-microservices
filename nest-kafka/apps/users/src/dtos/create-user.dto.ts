import { IsEmail, IsString } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
