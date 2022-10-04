import { Max, Min } from "class-validator";
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    brand: string;

    @Column()
    model: string;

    @Column({ default: false })
    used: boolean;

    @Column()
    price: number;

    @Column({ nullable: true, type: "float" })
    @Min(0)
    @Max(5)
    rating: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (owner) => owner.products)
    owner: User;

    @Column({ nullable: true })
    orderId: number;
}
