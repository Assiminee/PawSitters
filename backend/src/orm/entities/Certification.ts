import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";

@Entity()
export class Certification extends BaseModel {

    constructor() {
        super();
        this.title = '';
        this.organization = '';
        this.user = null;
        this.issueDate = null;
    }

    @Column({
        type: "varchar",
        length: 255
    })
    title: string;

    @Column({
        name: "issue_date",
        type: Date
    })
    issueDate: Date | null;

    @Column({
        type: "varchar",
        length: 255
    })
    organization: string;

    @ManyToOne(
        () => User,
        (user: User) => user.certifications
    )
    @JoinColumn({
        name: "user_id"
    })
    user: User | null;
}