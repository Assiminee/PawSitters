import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

export enum Roles {
    A = "Admin",
    PO = "Pet Owner",
    SP = "Service Provider"
}

@Entity()
export class Role {
    constructor() {
        this.role = '';
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({
        type: "enum",
        enum: Roles
    })
    role: string;

    @ManyToMany(
        () => User,
        (user: User) => user.roles
    )
    users!: User[];
}