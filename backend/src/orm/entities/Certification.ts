
import {BaseModel} from "./BaseModel";
import {Column, ManyToOne} from "typeorm";
import {User} from "./User";

export class Certification extends BaseModel {
    constructor() {
        super();
        this.title = '';
        this.issueDate = null;
        this.organization = '';
        this.user = null;
    }

    @Column({type: "varchar", length: 255})
    title: string

    @Column({type: Date})
    issueDate: Date | null

    @Column({type: "varchar", length: 255})
    organization: string

    @ManyToOne(() => User, (user: User) => user.certifications)
    user: User | null
}