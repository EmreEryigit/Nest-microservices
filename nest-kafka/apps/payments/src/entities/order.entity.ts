import { OrderStatus } from "@app/common/types/OrderStatus";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    price: number;

    @Column({ enum: OrderStatus })
    status: string;
}
