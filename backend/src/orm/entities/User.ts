import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    OneToOne,
    Unique,
    JoinColumn
} from "typeorm";
import {BaseModel} from "./BaseModel";
import {Address} from "./Address";
import {Certification} from "./Certification";
import {Role} from "./Role";
import {Review} from "./Review";
import {
    IsDate,
    IsEmail, IsEnum,
    IsNotEmpty, IsNumber,
    IsOptional, IsString,
    Matches, MinLength, Validate
} from "class-validator";
import {Booking} from "./Booking";
import {Pet} from "./Pet";
import {
    IsAdult,
    IsSitterFeeValidConstraint,
    IsValidPhone
} from "../custom_validation/UserCustomValidation";
import * as bcrypt from "bcrypt";

export enum Gender {
    F = "F",
    M = "M"
}

export enum AccountStat {
    A = "ACTIVE",
    D = "DELETED"
}

@Entity()
@Unique(['email'])
@Unique(['phone'])
@Unique(['bank_account_number'])
export class User extends BaseModel {
    @Column({
        type: "varchar",
        length: 50
    })
    @IsNotEmpty({message: "First name required"})
    @IsString({message: "First name must be a string"})
    fname!: string;

    @Column({
        type: "varchar",
        length: 50
    })
    @IsNotEmpty({message: "Last name required"})
    @IsString({message: "Last name must be a string"})
    lname!: string;

    @Column({
        type: "varchar",
        length: 255,
        nullable: true
    })
    @IsNotEmpty({message: "Email required"})
    @IsEmail({}, {message: "Invalid email"})
    email!: string | null;

    @Column({
        type: "varchar",
        length: 20,
        nullable: true
    })
    @IsOptional()
    @Validate(IsValidPhone)
    phone?: string | null;

    @Column({
        type: "varchar",
        length: 255,
        nullable: true
    })
    @IsNotEmpty({message: "Password required"})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, {
        message: "Password must be at least 8 characters long, contain lower and uppercase letters, a special character (@$!%*?&), and a number"
    })
    password!: string | null;

    @Column({
        type: "enum",
        enum: Gender
    })
    @IsNotEmpty({message: "Gender must be specified"})
    @IsEnum(Gender, {message: "Gender can either be 'F' (Female) or 'M' (Male)"})
    gender!: string;

    @Column({
        type: "date"
    })
    @IsNotEmpty({message: "Birthdate must be specified"})
    @IsDate({message: "Invalid birthdate"})
    @Validate(IsAdult)
    birthday!: Date;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    @Validate(IsSitterFeeValidConstraint)
    fee?: number | null;

    @Column({
        name: "bank_account_number",
        type: "varchar",
        length: 34,
        nullable: true
    })
    @IsOptional()
    @IsString()
    @MinLength(10, {message: "Invalid length"})
    bank_account_number?: string | null;

    @Column({type: "enum", enum: AccountStat, default: AccountStat.A})
    @IsOptional()
    @IsEnum(AccountStat)
    account_stat!: string;

    @Column({type: "varchar", length: 255, nullable: true})
    @IsOptional()
    image_path?: string | null;

    @OneToOne(
        () => Address,
        (address: Address) => address.user,
        {cascade: true}
    )
    @IsOptional()
    address!: Address;

    @OneToMany(
        () => Certification,
        (certification: Certification) => certification.user,
        {cascade: true}
    )
    @IsOptional()
    certifications!: Certification[];

    @ManyToOne(
        () => Role,
        (role: Role) => role.users,
    )
    @JoinColumn({name: "role_id"})
    @IsNotEmpty()
    role!: Role;

    @OneToMany(
        () => Pet,
        (pet: Pet) => pet.user,
        {cascade: true}
    )
    @IsOptional()
    pets!: Pet[];

    @OneToMany(
        () => Review,
        (review: Review) => review.reviewed,
    )
    @IsOptional()
    reviews_received!: Review[];

    @OneToMany(
        () => Review,
        (review: Review) => review.reviewer,
    )
    @IsOptional()
    reviews_given!: Review[];

    @OneToMany(
        () => Booking,
        (booking: Booking) => booking.owner,
        {cascade: true}
    )
    @IsOptional()
    bookings!: Booking[];

    @OneToMany(
        () => Booking,
        (Booking: Booking) => Booking.sitter
    )
    @IsOptional()
    sittings!: Booking[];

    @BeforeInsert()
    @BeforeUpdate()
    async normalize() {
        this.fname = this.fname.toLowerCase();
        this.lname = this.lname.toLowerCase();
        this.email = this.email ? this.email.toLowerCase() : null;

        if (this.bank_account_number)
            this.bank_account_number = this.bank_account_number.toLowerCase();
    }

    @AfterLoad()
    transform() {
        this.birthday = new Date(this.birthday);
        this.fee = this.fee ? Number(this.fee) : null;
    }

    async validatePassword(enteredPassword: string) {
        if (this.password)
            return bcrypt.compare(enteredPassword, this.password);
    }

    async encryptPassword() {
        if (this.password)
            this.password = await bcrypt.hash(this.password, 10);
    }
}