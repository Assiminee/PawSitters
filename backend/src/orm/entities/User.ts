import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserImage} from "./UserImage";

@Entity()
export class User {
    constructor() {
        this.fname = '';
        this.lname = '';
        this.email = '';
        this.phone = '';
        this.gender = '';
        this.birthday = null;
        this.fee = 0;
        this.bankAccountNumber = '';
        this.photos = [];
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("varchar", {length: 50})
    fname: string

    @Column("varchar", {length: 50})
    lname: string

    @Column({type: "varchar", length: 255, unique: true})
    email: string

    @Column({type: "varchar", length: 20, unique: true, nullable: true})
    phone: string

    @Column({type: "enum", enum: ["Female", "Male"]})
    gender: string

    @Column({type: "date", update: false})
    birthday: Date | null

    @Column({type: "decimal", precision: 10, scale: 2, nullable: true})
    fee: number

    @Column({type: "varchar", length: 34, nullable: true, unique: true})
    bankAccountNumber: string

    @OneToMany(() => UserImage, (userImage: UserImage) => userImage.user, { onDelete: "CASCADE" })
    photos: UserImage[]
}