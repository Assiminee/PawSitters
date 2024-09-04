import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import {User} from "./User";
import {IsEnum, IsNotEmpty} from "class-validator";

export enum Roles {
    A = "ADMIN",
    O = "OWNER",
    S = "SITTER"
}

@Entity()
@Unique(['role'])
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({
        type: "enum",
        enum: Roles
    })
    @IsNotEmpty({message: "Role title cannot be empty"})
    @IsEnum(Roles)
    role!: string;

    @OneToMany(
        () => User,
        (user: User) => user.role
    )
    users!: User[];
}