import {Column, Entity, OneToOne} from "typeorm";
import { BaseModel } from "./BaseModel";
import {Booking} from "./Booking";

@Entity()
export class Payment extends BaseModel {

    constructor() {
        super();
        this.amount = 0.00;
        this.transactionId = '';
        this.booking = null;
    }

    @Column({type: "decimal", precision: 10, scale: 2})
    amount: number;

    @Column({type: "timestamp", update: false, default: () => "CURRENT_TIMESTAMP"})
    date!: Date | null;

    @Column("varchar", {length: 45, name: "transaction_id"})
    transactionId: string;

    @OneToOne(
        () => Booking,
        (booking : Booking) => booking.payment
    )
    booking : Booking | null;
}
