import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class UserImage {
    constructor() {
        this.image = '';
        this.user = null;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 255, unique: true})
    image: string

    @ManyToOne(() => User, (user: User) => user.photos)
    user: User | null
}