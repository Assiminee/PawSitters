
import {BaseModel} from "./BaseModel";
import {Column, JoinTable, ManyToMany} from "typeorm";
import {User} from "./User";

export class Role extends BaseModel {
    constructor() {
        super();
        this.role = "Pet Owner";
        this.users = null;
    }

    @Column({
        type: "enum", default: "Pet Owner",
        enum: ["Admin", "Pet Owner", "Service Provider"]
    })
    role: string

    @ManyToMany(() => User, (user: User) => user.roles)
    @JoinTable({name: "userRoles"})
    users: User[] | null;
}