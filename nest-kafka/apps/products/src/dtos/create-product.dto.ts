import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    brand: string;

    @IsNotEmpty()
    @IsString()
    model: string;

    @IsBoolean()
    @IsOptional()
    used: boolean;

    @IsNumber()
    @Min(0)
    @Max(1000000)
    price: number;

 /*    @IsNumber({
        maxDecimalPlaces: 1,
    })
    @Min(0)
    @Max(5)
    rating: number; */
}
