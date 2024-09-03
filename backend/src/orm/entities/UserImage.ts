import {Column, Entity, JoinColumn, ManyToOne, Unique} from "typeorm";
import {User} from "./User";
import {BaseModel} from "./BaseModel";
import {IsNotEmpty, IsString} from "class-validator";

@Entity()
@Unique(['path'])
export class UserImage extends BaseModel {
    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty({message: "Missing user image path"})
    @IsString({message: "User image path must be a string"})
    path!: string;

    @ManyToOne(
        () => User,
        (user: User) => user.photos
    )
    @JoinColumn({
        name: "user_id"
    })
    @IsNotEmpty()
    user!: User;
}