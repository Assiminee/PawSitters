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

/**
 * Enum representing user genders.
 */
export enum Gender {
    F = "F",  // Female
    M = "M"   // Male
}

/**
 * Enum representing account statuses.
 */
export enum AccountStat {
    A = "ACTIVE",   // Active account
    D = "DELETED"   // Deleted account
}

/**
 * Entity representing a user in the system.
 *
 * This entity stores user information including personal details, role, certifications, pets, and reviews.
 * It includes methods for password encryption and validation.
 *
 * @extends BaseModel
 * @entity
 * @unique email, phone, bank_account_number
 */
@Entity()
@Unique(['email'])
@Unique(['phone'])
@Unique(['bank_account_number'])
export class User extends BaseModel {

    /**
     * The user's first name.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 50
    })
    @IsNotEmpty({message: "First name required"})
    @IsString({message: "First name must be a string"})
    fname!: string;

    /**
     * The user's last name.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 50
    })
    @IsNotEmpty({message: "Last name required"})
    @IsString({message: "Last name must be a string"})
    lname!: string;

    /**
     * The user's email address.
     *
     * @type {string | null}
     */
    @Column({
        type: "varchar",
        length: 255,
        nullable: true
    })
    @IsNotEmpty({message: "Email required"})
    @IsEmail({}, {message: "Invalid email"})
    email!: string | null;

    /**
     * The user's phone number.
     *
     * @type {string | null}
     */
    @Column({
        type: "varchar",
        length: 20,
        nullable: true
    })
    @IsOptional()
    @Validate(IsValidPhone)
    phone?: string | null;

    /**
     * The user's password.
     *
     * @type {string | null}
     */
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

    /**
     * The user's gender.
     *
     * @type {string}
     */
    @Column({
        type: "enum",
        enum: Gender
    })
    @IsNotEmpty({message: "Gender must be specified"})
    @IsEnum(Gender, {message: "Gender can either be 'F' (Female) or 'M' (Male)"})
    gender!: string;

    /**
     * The user's birthdate.
     *
     * @type {Date}
     */
    @Column({
        type: "date"
    })
    @IsNotEmpty({message: "Birthdate must be specified"})
    @IsDate({message: "Invalid birthdate"})
    @Validate(IsAdult)
    birthday!: Date;

    /**
     * The user's fee, if applicable.
     *
     * @type {number | null}
     */
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

    /**
     * The user's bank account number.
     *
     * @type {string | null}
     */
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

    /**
     * The user's account status.
     *
     * @type {string}
     */
    @Column({type: "enum", enum: AccountStat, default: AccountStat.A})
    @IsOptional()
    @IsEnum(AccountStat)
    account_stat!: string;

    /**
     * The path to the user's profile image.
     *
     * @type {string | null}
     */
    @Column({type: "varchar", length: 255, nullable: true})
    @IsOptional()
    image_path?: string | null;

    /**
     * The user's address.
     *
     * @type {Address}
     */
    @OneToOne(
        () => Address,
        (address: Address) => address.user,
        {cascade: true}
    )
    @IsOptional()
    address!: Address;

    /**
     * The certifications associated with the user.
     *
     * @type {Certification[]}
     */
    @OneToMany(
        () => Certification,
        (certification: Certification) => certification.user,
        {cascade: true}
    )
    @IsOptional()
    certifications!: Certification[];

    /**
     * The role assigned to the user.
     *
     * @type {Role}
     */
    @ManyToOne(
        () => Role,
        (role: Role) => role.users,
    )
    @JoinColumn({name: "role_id"})
    @IsNotEmpty()
    role!: Role;

    /**
     * The pets owned by the user.
     *
     * @type {Pet[]}
     */
    @OneToMany(
        () => Pet,
        (pet: Pet) => pet.user,
        {cascade: true}
    )
    @IsOptional()
    pets!: Pet[];

    /**
     * The reviews received by the user.
     *
     * @type {Review[]}
     */
    @OneToMany(
        () => Review,
        (review: Review) => review.reviewed,
    )
    @IsOptional()
    reviews_received!: Review[];

    /**
     * The reviews given by the user.
     *
     * @type {Review[]}
     */
    @OneToMany(
        () => Review,
        (review: Review) => review.reviewer,
    )
    @IsOptional()
    reviews_given!: Review[];

    /**
     * The bookings made by the user.
     *
     * @type {Booking[]}
     */
    @OneToMany(
        () => Booking,
        (booking: Booking) => booking.owner,
        {cascade: true}
    )
    @IsOptional()
    bookings!: Booking[];

    /**
     * The sittings (bookings) where the user is the sitter.
     *
     * @type {Booking[]}
     */
    @OneToMany(
        () => Booking,
        (Booking: Booking) => Booking.sitter
    )
    @IsOptional()
    sittings!: Booking[];

    /**
     * Normalizes fields before insertion or update.
     */
    @BeforeInsert()
    @BeforeUpdate()
    async normalize() {
        this.fname = this.fname.toLowerCase();
        this.lname = this.lname.toLowerCase();
        this.email = this.email ? this.email.toLowerCase() : null;

        if (this.bank_account_number)
            this.bank_account_number = this.bank_account_number.toLowerCase();
    }

    /**
     * Transforms fields after loading from the database.
     */
    @AfterLoad()
    transform() {
        this.birthday = new Date(this.birthday);
        this.fee = this.fee ? Number(this.fee) : null;
    }

    /**
     * Validates the given password against the stored hashed password.
     *
     * @param enteredPassword The password to validate.
     * @returns A boolean indicating if the password matches.
     */
    async validatePassword(enteredPassword: string) {
        if (this.password)
            return bcrypt.compare(enteredPassword, this.password);
    }

    /**
     * Encrypts the user's password using bcrypt.
     */
    async encryptPassword() {
        if (this.password)
            this.password = await bcrypt.hash(this.password, 10);
    }

    /**
     * Gets a minimal representation of the user's information.
     *
     * @returns An object with minimal user information.
     */
    getMinimalInfo() {
        let obj = {
            id: this.id,
            fname: this.fname,
            lname: this.lname,
            email: this.email,
            phone: this.phone,
            gender: this.gender,
            birthday: this.birthday,
            account_stat: this.account_stat,
            fee: this.fee
        }
        if (!this.fee)
            delete obj.fee;
        return obj;
    }
}