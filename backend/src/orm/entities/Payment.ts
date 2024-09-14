import {Column, Entity, OneToOne, Unique} from "typeorm";
import { BaseModel } from "./BaseModel";
import {Booking} from "./Booking";
import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

@Entity()
@Unique(['transaction_id'])
export class Payment extends BaseModel {
    @Column({type: "decimal", precision: 10, scale: 2})
    @IsNotEmpty()
    @IsNumber()
    amount!: number;

    @Column({type: "timestamp", update: false, default: () => "CURRENT_TIMESTAMP"})
    @IsOptional()
    date!: Date;

    @Column("varchar", {length: 45})
    @IsNotEmpty()
    @IsString()
    transaction_id!: string;

    @OneToOne(
        () => Booking,
        (booking : Booking) => booking.payment
    )
    @IsNotEmpty()
    booking!: Booking;
}
