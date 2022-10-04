import { Column, Entity,  OneToMany, PrimaryColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class User {
    @PrimaryColumn()
    id: number;

    @Column()
    email: string;

    @OneToMany(() => Product, (products) => products.owner)
    products: Product[];
}
