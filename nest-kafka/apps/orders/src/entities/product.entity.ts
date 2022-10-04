import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity()
export class Product {
    @PrimaryColumn()
    id: number

    @Column()
    brand: string

    @Column()
    model: string

    @Column()
    price: number
}