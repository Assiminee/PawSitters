import {Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne} from "typeorm";
import {UserImage} from "./UserImage";
import {BaseModel} from "./BaseModel";
import {Address} from "./Address";
import {Certification} from "./Certification";
import {Role} from "./Role";
import {Review} from "./Review";
import {
    IsDate,
    IsDecimal,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    MinLength
} from "class-validator";

@Entity()
export class User extends BaseModel {
    constructor() {
        super();
        this.fname = '';
        this.lname = '';
        this.email = '';
        this.phone = '';
        this.password = '';
        this.gender = '';
        this.bankAccountNumber = '';
        this.birthday = null;
        this.photos = null;
        this.address = null;
        this.certifications = null;
        this.roles = null;
        this.reviewsReceived = null;
        this.reviewsGiven = null;
        this.fee = 0;
    }

    @Column("varchar", {length: 50})
    @IsNotEmpty()
    fname: string

    @Column("varchar", {length: 50})
    @IsNotEmpty()
    lname: string

    @Column({type: "varchar", length: 255, unique: true})
    @IsNotEmpty()
    @IsEmail()
    email: string

    @Column({type: "varchar", length: 20, unique: true, nullable: true})
    @IsOptional()
    @IsPhoneNumber()
    phone: string

    @Column({type: "varchar", length: 255})
    @IsNotEmpty()
    @MinLength(10)
    password: string

    @Column({type: "enum", enum: ["Female", "Male"]})
    gender: string

    @Column({type: "date", update: false})
    @IsDate()
    birthday: Date | null

    @Column({type: "decimal", precision: 10, scale: 2, nullable: true})
    @IsOptional()
    @IsDecimal()
    fee: number

    @Column({type: "varchar", length: 34, nullable: true, unique: true})
    bankAccountNumber: string

    @OneToMany(() => UserImage, (userImage: UserImage) => userImage.user, {nullable: true, onDelete: "CASCADE"})
    photos: UserImage[] | null

    @OneToOne(() => Address, (address: Address) => address.user, {nullable: true, onDelete: "CASCADE"})
    address: Address | null

    @OneToMany(() => Certification, (certification: Certification) => certification.user, {
        nullable: true,
        onDelete: "CASCADE"
    })
    certifications: Certification[] | null

    @ManyToMany(() => Role, (role: Role) => role.users)
    @JoinTable({name: "userRoles"})
    roles: Role[] | null;

    @OneToMany(() => Review, (review: Review) => review.reviewed, {nullable: true, onDelete: "CASCADE"})
    reviewsReceived: Review[] | null

    @OneToMany(() => Review, (review: Review) => review.reviewer, {nullable: true, onDelete: "CASCADE"})
    reviewsGiven: Review[] | null
}