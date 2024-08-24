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

export enum Gender {
    FEMALE = "Female",
    MALE = "Male"
}

@Entity()
export class User extends BaseModel {
    constructor() {
        super();
        this.fname = '';
        this.lname = '';
        this.email = '';
        this.password = '';
        this.gender = '';
        this.birthday = null;
        this.phone = null;
        this.bankAccountNumber = null;
        this.photos = null;
        this.address = null;
        this.certifications = null;
        this.roles = null;
        this.reviewsReceived = null;
        this.reviewsGiven = null;
        this.fee = null;
    }

    @Column({
        name: "f_name",
        type: "varchar",
        length: 50
    })
    @IsNotEmpty()
    fname: string

    @Column({
        name: "l_name",
        type: "varchar",
        length: 50
    })
    @IsNotEmpty()
    lname: string

    @Column({
        type: "varchar",
        length: 255,
        unique: true
    })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @Column({
        type: "varchar",
        length: 20,
        unique: true,
        nullable: true
    })
    @IsOptional()
    @IsPhoneNumber()
    phone: string | null

    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @MinLength(10)
    password: string

    @Column({
        type: "enum",
        enum: Gender
    })
    gender: string

    @Column({
        type: "date",
        update: false
    })
    @IsDate()
    birthday: Date | null

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    @IsOptional()
    @IsDecimal()
    fee: number | null

    @Column({
        name: "bank_account_number",
        type: "varchar",
        length: 34,
        nullable: true,
        unique: true
    })
    bankAccountNumber: string | null

    @OneToMany(
        () => UserImage,
        (userImage: UserImage) => userImage.user,
        {nullable: true, onDelete: "CASCADE"}
    )
    photos: UserImage[] | null

    @OneToOne(
        () => Address,
        (address: Address) => address.user,
        {nullable: true, onDelete: "CASCADE"}
    )
    address: Address | null

    @OneToMany(
        () => Certification,
        (certification: Certification) => certification.user,
        {nullable: true, onDelete: "CASCADE"}
    )
    certifications: Certification[] | null

    @ManyToMany(
        () => Role,
        (role: Role) => role.users
    )
    @JoinTable({
        name: "user_role"
    })
    roles: Role[] | null;

    @OneToMany(
        () => Review,
        (review: Review) => review.reviewed,
        {nullable: true, onDelete: "CASCADE"}
    )
    reviewsReceived: Review[] | null

    @OneToMany(
        () => Review,
        (review: Review) => review.reviewer,
        {nullable: true, onDelete: "CASCADE"}
    )
    reviewsGiven: Review[] | null
}