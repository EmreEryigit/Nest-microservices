import { OrderStatus } from "@app/common/types/OrderStatus";
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, (product) => product.orders)
    product: Product;

    @Column()
    expiresAt: Date;

    @Column({
        enum: OrderStatus,
        default: OrderStatus.Created,
    })
    status: string;

    @Column()
    userId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
