import {Column, Entity, OneToOne, Unique} from "typeorm";
import { BaseModel } from "./BaseModel";
import {Booking} from "./Booking";
import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

/**
 * Entity representing a payment associated with a booking.
 *
 * Extends `BaseModel` to inherit common fields and methods.
 *
 * @extends BaseModel
 * @entity
 */
@Entity()
@Unique(['transaction_id'])
export class Payment extends BaseModel {

    /**
     * The amount of the payment.
     *
     * Must be a non-empty number with two decimal places.
     *
     * @type {number}
     */
    @Column({type: "decimal", precision: 10, scale: 2})
    @IsNotEmpty()
    @IsNumber()
    amount!: number;

    /**
     * The date when the payment was made.
     *
     * Defaults to the current timestamp if not provided. This field is optional.
     *
     * @type {Date}
     */
    @Column({type: "timestamp", update: false, default: () => "CURRENT_TIMESTAMP"})
    @IsOptional()
    date!: Date;

    /**
     * The unique transaction identifier for the payment.
     *
     * Must be a non-empty string with a maximum length of 45 characters.
     *
     * @type {string}
     */
    @Column("varchar", {length: 45})
    @IsNotEmpty()
    @IsString()
    transaction_id!: string;

    /**
     * The booking associated with this payment.
     *
     * References the `Booking` entity with a one-to-one relationship.
     *
     * @type {Booking}
     */
    @OneToOne(
        () => Booking,
        (booking : Booking) => booking.payment
    )
    @IsNotEmpty()
    booking!: Booking;
}
