import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity()
export class Product {
    @PrimaryColumn()
    id: number;

    @Column()
    brand: string;

    @Column()
    model: string;

    @Column()
    price: number;

    @OneToMany(() => Order, (orders) => orders.product)
    orders: Order[];
}
