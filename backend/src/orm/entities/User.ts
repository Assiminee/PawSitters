import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    Unique
} from "typeorm";
import {UserImage} from "./UserImage";
import {BaseModel} from "./BaseModel";
import {Address} from "./Address";
import {Certification} from "./Certification";
import {Role} from "./Role";
import {Review} from "./Review";
import {
    IsDate,
    IsEmail, IsEnum,
    IsNotEmpty, IsNumber, IsNumberString,
    IsOptional, IsString,
    Matches, MinLength, Validate
} from "class-validator";
import {Booking} from "./Booking";
import {Pet} from "./Pet";
import {
    HasNoDuplicateRoles,
    IsAdult,
    IsNotEmptyRolesArray,
    IsSitterFeeValidConstraint,
    IsValidPhone
} from "../custom_validation/UserCustomValidation";

export enum Gender {
    F = "F",
    M = "M"
}

export enum AccountStat {
    P = "PENDING",
    A = "ACTIVATED",
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
        length: 255
    })
    @IsNotEmpty({message: "Email required"})
    @IsEmail({}, {message: "Invalid email"})
    email!: string;

    @Column({
        type: "varchar",
        length: 20,
        nullable: true
    })
    @Validate(IsValidPhone)
    phone?: string | null;

    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty({message: "Password required"})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, {
        message: "Password must be at least 8 characters long, contain lower and uppercase letters, a special character (@$!%*?&), and a number"
    })
    password!: string;

    @Column({
        type: "enum",
        enum: Gender
    })
    @IsNotEmpty({message: "Gender must be specified"})
    @IsEnum(Gender, {message: "Gender can either be 'F' (Female) or 'M' (Male)"})
    gender!: string;

    @Column({
        type: "date",
        update: false
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
    @IsNumber({}, {message: "Fee must be a number"})
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
    @MinLength(34, {message: "Invalid length"})
    bank_account_number?: string | null;

    @Column({type: "enum", enum: AccountStat, default: AccountStat.P})
    @IsOptional()
    @IsEnum(AccountStat)
    account_stat!: string;

    @OneToMany(
        () => UserImage,
        (userImage: UserImage) => userImage.user
    )
    @IsOptional()
    photos!: UserImage[];

    @OneToOne(
        () => Address,
        (address: Address) => address.user
    )
    @IsOptional()
    address!: Address;

    @OneToMany(
        () => Certification,
        (certification: Certification) => certification.user
    )
    @IsOptional()
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
    @Validate(IsNotEmptyRolesArray)
    @Validate(HasNoDuplicateRoles)
    roles!: Role[];

    @OneToMany(
        () => Pet,
        (pets) => pets.user
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
        (booking : Booking) => booking.owner
    )
    @IsOptional()
    bookings!: Booking[];

    @OneToMany(
        () => Booking,
        (Booking : Booking) => Booking.sitter
    )
    @IsOptional()
    sittings!: Booking[];

    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.fname = this.fname.toLowerCase();
        this.lname = this.lname.toLowerCase();
        this.email = this.email.toLowerCase();

        if (this.bank_account_number )
            this.bank_account_number = this.bank_account_number.toLowerCase();
    }

    @AfterLoad()
    transform() {
        this.birthday = new Date(this.birthday);
        if (this.fee)
            this.fee = Number(this.fee);
    }
}