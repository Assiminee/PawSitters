import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {Payment} from "./Payment";
import {Pet} from "./Pet";

export enum PaymentStats {
    PENDING = "Pending",
    ACTIVE = "Active",
    CANCELLED = "Cancelled",
    COMPLETE = "Complete"
}

@Entity()
export class Booking extends BaseModel {
    constructor() {
        super();
        this.start_time =  "00:00";
        this.end_time =  "00:00";
        this.owner = null;
        this.sitter = null;
        this.payment = null;
        this.end_date = null;
        this.start_date = null;
        this.status = '';
    }

    @ManyToOne(
        () => User,
        (user: User) => user.bookings
    )
    @JoinColumn({name: "owner_id"})
    owner: User | null;

    @ManyToOne(
        () => User,
        (user: User) => user.sittings
    )
    @JoinColumn({name: "sitter_id"})
    sitter: User | null;

    @OneToOne(
        () => Payment,
        (payment: Payment) => payment.booking
    )
    @JoinColumn({name: "payment_id"})
    payment: Payment | null;

    @Column({
        type: "enum",
        enum: PaymentStats
    })
    status: string;

    @Column({type: "date", update: false})
    start_date: Date | null;

    @Column({type: "date", update: false})
    end_date: Date | null;

    @Column({type: "time", nullable: false})
    start_time: string;

    @Column({type: "time", nullable: false})
    end_time: string;

    @ManyToMany(() => Pet, (pet : Pet) => pet.bookings)
    @JoinTable({
        name: 'pet_bookings',
        joinColumn: {name: "booking_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "pet_id", referencedColumnName: "id"}
    })
    pets!: Pet[];
}
