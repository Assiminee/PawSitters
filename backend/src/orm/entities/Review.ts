import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Max, Min} from "class-validator";
import {BaseModel} from "./BaseModel";
import {User} from "./User";

@Entity()
export class Review extends BaseModel {
    constructor() {
        super();
        this.reviewed = null;
        this.reviewer = null;
        this.review = '';
        this.rating = 0;
    }

    @ManyToOne(
        () => User,
        (user: User) => user.reviewsReceived
    )
    @JoinColumn({
        name: "reviewed_id"
    })
    reviewed: User | null

    @ManyToOne(
        () => User,
        (user: User) => user.reviewsGiven
    )
    @JoinColumn({
        name: "reviewer_id"
    })
    reviewer: User | null

    @Column({
        type: "varchar",
        length: 255
    })
    review: string

    @Column({type: "int"})
    @Min(0)
    @Max(5)
    rating: number
}