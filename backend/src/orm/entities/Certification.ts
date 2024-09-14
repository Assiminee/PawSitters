import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {IsDate, IsNotEmpty, IsString} from "class-validator";

@Entity()
export class Certification extends BaseModel {
    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    title!: string;

    @Column({ type: Date })
    @IsNotEmpty()
    @IsDate()
    issue_date!: Date;

    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    organization!: string;

    @ManyToOne(
        () => User,
        (user: User) => user.certifications
    )
    @JoinColumn({ name: "user_id" })
    @IsNotEmpty()
    user!: User;
}