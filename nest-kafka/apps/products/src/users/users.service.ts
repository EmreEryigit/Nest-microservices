import { UserPayload } from "@app/common/middlewares/current-user.middleware";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) {}

    async createUser(user: UserPayload) {
        const foundUser = await this.repo.findOneBy({ id: user.id });
        if (foundUser) {
            return;
        }

        const newUser = await this.repo.create(user);
        await this.repo.save(user);
        return user;
    }

    async findUser(id: number) {
        const user = await this.repo.findOne({
            where: { id },
            relations: {
                products: true,
            },
        });
        return user;
    }
}
