import { Expose, Transform } from "class-transformer";
import { User } from "../entities/user.entity";

export class ProductDto {
    @Expose()
    id: number;

    @Expose()
    brand: string;

    @Expose()
    model: string;

    @Expose()
    used: boolean;

    @Expose()
    price: number;

    @Expose()
    rating: number;

    @Expose()
    orderId: number;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Transform(({ obj }) => {
        return {
            userId: obj.owner?.id,
            email: obj.owner?.email,
        };
    })
    @Expose()
    owner?: User;

   
}
