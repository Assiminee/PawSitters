import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {IsNotEmpty, IsNumber, IsString, Max, Min, MinLength} from "class-validator";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {Booking} from "./Booking";

/**
 * Entity representing a review.
 *
 * Extends `BaseModel` to inherit common fields and methods.
 *
 * @extends BaseModel
 * @entity
 */
@Entity()
export class Review extends BaseModel {

    /**
     * The user who is being reviewed.
     *
     * Must be a valid `User` instance and is linked to the `User` entity through `reviews_received`.
     *
     * @type {User}
     */
    @ManyToOne(
        () => User,
        (user: User) => user.reviews_received
    )
    @JoinColumn({
        name: "reviewed_id"
    })
    @IsNotEmpty()
    reviewed!: User;


    /**
     * The user who wrote the review.
     *
     * Must be a valid `User` instance and is linked to the `User` entity through `reviews_given`.
     *
     * @type {User}
     */
    @ManyToOne(
        () => User,
        (user: User) => user.reviews_given
    )
    @JoinColumn({
        name: "reviewer_id"
    })
    @IsNotEmpty()
    reviewer!: User;

    /**
     * The booking associated with this review.
     *
     * Must be a valid `Booking` instance.
     *
     * @type {Booking}
     */
    @ManyToOne(
        () => Booking,
        (booking: Booking) => booking.reviews
    )
    @JoinColumn({name: "booking_id"})
    booking!: Booking;

    /**
     * The text of the review.
     *
     * Must be a non-empty string with a minimum length of 30 characters.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(30)
    review!: string;

    /**
     * The rating given in the review.
     *
     * Must be a number between 1 and 5 (inclusive).
     *
     * @type {number}
     */
    @Column({type: "int", default: 1})
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;
}