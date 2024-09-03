import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {Payment} from "./Payment";
import {Pet} from "./Pet";
import {IsDate, IsEnum, IsNotEmpty, IsOptional, IsString} from "class-validator";

export enum BookingStat {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    COMPLETE = "COMPLETED"
}

@Entity()
export class Booking extends BaseModel {
    @ManyToOne(
        () => User,
        (user: User) => user.bookings
    )
    @JoinColumn({name: "owner_id"})
    @IsNotEmpty()
    owner!: User;

    @ManyToOne(
        () => User,
        (user: User) => user.sittings
    )
    @JoinColumn({name: "sitter_id"})
    @IsNotEmpty()
    sitter!: User;

    @OneToOne(
        () => Payment,
        (payment: Payment) => payment.booking
    )
    @JoinColumn({name: "payment_id"})
    @IsOptional()
    payment?: Payment | null;

    @Column({
        type: "enum",
        enum: BookingStat,
        default: BookingStat.PENDING
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum(BookingStat)
    status!: string;

    @Column({type: "date", update: false})
    @IsNotEmpty({message: "Must specify a start date"})
    @IsDate()
    start_date!: Date;

    @Column({type: "date", update: false})
    @IsNotEmpty({message: "Must specify a end date"})
    @IsDate()
    end_date!: Date;

    @ManyToMany(() => Pet, (pet : Pet) => pet.bookings)
    @JoinTable({
        name: 'pet_bookings',
        joinColumn: {name: "booking_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "pet_id", referencedColumnName: "id"}
    })
    @IsNotEmpty()
    pets!: Pet[];
}
