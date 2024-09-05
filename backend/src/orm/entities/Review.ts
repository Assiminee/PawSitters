import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";
import {BaseModel} from "./BaseModel";
import {User} from "./User";

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

    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    review!: string;

    @Column({type: "int", default: 1})
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;
}