import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {User} from "./User";
import {BaseModel} from "./BaseModel";

@Entity()
export class UserImage extends BaseModel {
    constructor() {
        super();
        this.image = '';
        this.user = null;
    }

    @Column({
        type: "varchar",
        length: 255,
        unique: true
    })
    image: string;

    @ManyToOne(
        () => User,
        (user: User) => user.photos
    )
    @JoinColumn({
        name: "user_id"
    })
    user: User | null;
}