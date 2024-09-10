import {AfterLoad, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {Payment} from "./Payment";
import {Pet} from "./Pet";
import {ArrayNotEmpty, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, Validate} from "class-validator";
import {
    HasBankAccountNumber, HasFeeSpecified,
    HasOwnerRole,
    HasSitterRole,
    InSameCityCountry, IsValidInterval
} from "../custom_validation/BookingCustomValidation";
import {Review} from "./Review";

export enum BookingStat {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

@Entity()
export class Booking extends BaseModel {
    @ManyToOne(
        () => User,
        (user: User) => user.bookings
    )
    @JoinColumn({name: "owner_id"})
    @IsNotEmpty()
    @Validate(HasOwnerRole)
    @Validate(HasBankAccountNumber)
    owner!: User;

    @ManyToOne(
        () => User,
        (user: User) => user.sittings
    )
    @JoinColumn({name: "sitter_id"})
    @IsNotEmpty()
    @Validate(HasSitterRole)
    @Validate(InSameCityCountry)
    @Validate(HasBankAccountNumber)
    @Validate(HasFeeSpecified)
    sitter!: User;

    @OneToOne(
        () => Payment,
        (payment: Payment) => payment.booking,
        {cascade : true}
    )
    @JoinColumn({name: "payment_id"})
    @IsOptional()
    payment?: Payment | null;

    @OneToMany(
        () => Review,
        (review: Review) => review.booking,
        {cascade: true}
    )
    reviews!: Review[];

    @Column({
        type: "enum",
        enum: BookingStat,
        default: BookingStat.PENDING
    })
    @IsOptional()
    @IsString()
    @IsEnum(BookingStat)
    status!: string;

    @Column({type: "date", update: false})
    @IsNotEmpty({message: "Must specify a start date"})
    @IsDate()
    start_date!: Date;

    @Column({type: "date", update: false})
    @IsNotEmpty({message: "Must specify an end date"})
    @IsDate()
    @Validate(IsValidInterval)
    end_date!: Date;

    @ManyToMany(() => Pet, (pet : Pet) => pet.bookings)
    @JoinTable({
        name: 'pet_bookings',
        joinColumn: {name: "booking_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "pet_id", referencedColumnName: "id"}
    })
    @ArrayNotEmpty({ message: 'A booking must involve at least one pet' })
    pets!: Pet[];

    @AfterLoad()
    transform() {
        this.start_date = new Date(this.start_date);
        this.end_date = new Date(this.end_date);
    }
}
