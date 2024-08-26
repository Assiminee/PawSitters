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
import {Booking} from "./Booking";
import {Pet} from "./Pet";
import exp from "node:constants";

export enum Gender {
    F = "Female",
    M = "Male"
}

export enum AccountStat {
    P = "Pending Activation",
    A = "Activated",
    D = "DELETED"
}

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
        this.birthday = null;
        this.fee = 0.00;
        this.bankAccountNumber = '';
        this.accountStat = '';
        this.address = null;
    }


    @Column({
        name: "f_name",
        type: "varchar",
        length: 50
    })
    @IsNotEmpty()
    fname: string;

    @Column({
        name: "l_name",
        type: "varchar",
        length: 50
    })
    @IsNotEmpty()
    lname: string;

    @Column({
        type: "varchar",
        length: 255,
        unique: true
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Column({
        type: "varchar",
        length: 20,
        unique: true,
        nullable: true
    })
    @IsOptional()
    @IsPhoneNumber()
    phone: string;

    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @MinLength(10)
    password: string;

    @Column({
        type: "enum",
        enum: Gender
    })
    gender: string;

    @Column({
        type: "date",
        update: false
    })
    @IsDate()
    birthday: Date | null;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    @IsOptional()
    @IsDecimal()
    fee: number;

    @Column({
        name: "bank_account_number",
        type: "varchar",
        length: 34,
        nullable: true,
        unique: true
    })
    bankAccountNumber: string;

    @Column({type: "enum", enum: AccountStat, name: "account_stat"})
    accountStat: string;

    @OneToMany(
        () => UserImage,
        (userImage: UserImage) => userImage.user
    )
    photos!: UserImage[];

    @OneToOne(
        () => Address,
        (address: Address) => address.user
    )
    address: Address | null;

    @OneToMany(
        () => Certification,
        (certification: Certification) => certification.user
    )
    certifications!: Certification[];

    @ManyToMany(
        () => Role,
        (role: Role) => role.users
    )
    @JoinTable({
        name: "user_role",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
    })
    roles!: Role[];

    @OneToMany(
        () => Pet,
        (pets) => pets.user
    )
    pets!: Pet[];

    @OneToMany(
        () => Review,
        (review: Review) => review.reviewed,
    )
    reviewsReceived!: Review[];

    @OneToMany(
        () => Review,
        (review: Review) => review.reviewer,
    )
    reviewsGiven!: Review[];

    @OneToMany(
        () => Booking,
        (booking : Booking) => booking.owner
    )
    bookings!: Booking[];

    @OneToMany(
        () => Booking,
        (Booking : Booking) => Booking.sitter
    )
    sittings!: Booking[];
}