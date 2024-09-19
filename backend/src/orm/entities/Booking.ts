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

/**
 * Enum representing possible booking statuses.
 *
 * @enum {string}
 */
export enum BookingStat {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

/**
 * Entity representing a booking.
 *
 * Extends `BaseModel` to inherit common fields and methods.
 *
 * @extends BaseModel
 */
@Entity()
export class Booking extends BaseModel {

    /**
     * The user who owns the booking.
     *
     * References the `User` entity with a many-to-one relationship.
     * Ensures the user has the owner role and a bank account number.
     *
     * @type {User}
     */
    @ManyToOne(
        () => User,
        (user: User) => user.bookings
    )
    @JoinColumn({name: "owner_id"})
    @IsNotEmpty()
    @Validate(HasOwnerRole)
    @Validate(HasBankAccountNumber)
    owner!: User;

    /**
     * The user who sits the pet in the booking.
     *
     * References the `User` entity with a many-to-one relationship.
     * Ensures the user has the sitter role, the same city and country as the owner, a bank account number, and has specified a fee.
     *
     * @type {User}
     */
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

    /**
     * The payment associated with the booking.
     *
     * References the `Payment` entity with a one-to-one relationship.
     *
     * @type {Payment | null}
     * @optional
     */
    @OneToOne(
        () => Payment,
        (payment: Payment) => payment.booking,
        {cascade : true}
    )
    @JoinColumn({name: "payment_id"})
    @IsOptional()
    payment?: Payment | null;

    /**
     * Reviews associated with the booking.
     *
     * References the `Review` entity with a one-to-many relationship.
     *
     * @type {Review[]}
     */
    @OneToMany(
        () => Review,
        (review: Review) => review.booking,
        {cascade: true}
    )
    reviews!: Review[];

    /**
     * Status of the booking, represented by the `BookingStat` enum.
     *
     * @type {string}
     * @default BookingStat.PENDING
     */
    @Column({
        type: "enum",
        enum: BookingStat,
        default: BookingStat.PENDING
    })
    @IsOptional()
    @IsString()
    @IsEnum(BookingStat)
    status!: string;

    /**
     * Start date of the booking.
     *
     * @type {Date}
     */
    @Column({type: "date", update: false})
    @IsNotEmpty({message: "Must specify a start date"})
    @IsDate()
    start_date!: Date;

    /**
     * End date of the booking.
     *
     * @type {Date}
     * @validate IsValidInterval
     */
    @Column({type: "date", update: false})
    @IsNotEmpty({message: "Must specify an end date"})
    @IsDate()
    @Validate(IsValidInterval)
    end_date!: Date;

    /**
     * Pets associated with the booking.
     *
     * References the `Pet` entity with a many-to-many relationship.
     * Ensures that at least one pet is associated with the booking.
     *
     * @type {Pet[]}
     */
    @ManyToMany(() => Pet, (pet : Pet) => pet.bookings)
    @JoinTable({
        name: 'pet_bookings',
        joinColumn: {name: "booking_id", referencedColumnName: "id"},
        inverseJoinColumn: {name: "pet_id", referencedColumnName: "id"}
    })
    @ArrayNotEmpty({ message: 'A booking must involve at least one pet' })
    pets!: Pet[];

    /**
     * Converts date fields to `Date` objects after loading from the database.
     */
    @AfterLoad()
    transform() {
        this.start_date = new Date(this.start_date);
        this.end_date = new Date(this.end_date);
    }
}
