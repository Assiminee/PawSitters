import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {IsNotEmpty, IsNumber, IsString, Max, Min, MinLength} from "class-validator";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {Booking} from "./Booking";

@Entity()
export class Review extends BaseModel {
    @ManyToOne(
        () => User,
        (user: User) => user.reviews_received
    )
    @JoinColumn({
        name: "reviewed_id"
    })
    @IsNotEmpty()
    reviewed!: User;

    @ManyToOne(
        () => User,
        (user: User) => user.reviews_given
    )
    @JoinColumn({
        name: "reviewer_id"
    })
    @IsNotEmpty()
    reviewer!: User;

    @ManyToOne(
        () => Booking,
        (booking: Booking) => booking.reviews
    )
    @JoinColumn({name: "booking_id"})
    booking!: Booking;

    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(30)
    review!: string;

    @Column({type: "int", default: 1})
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;


}