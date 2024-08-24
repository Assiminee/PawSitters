import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Role {
    constructor() {
        this.role = "Pet Owner";
        this.users = null;
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({
        type: "enum", default: "Pet Owner",
        enum: ["Admin", "Pet Owner", "Service Provider"]
    })
    role: string

    @ManyToMany(
        () => User,
        (user: User) => user.roles
    )
    @JoinTable({
        name: "user_role"
    })
    users: User[] | null;
}