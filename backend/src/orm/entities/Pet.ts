import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    Unique
} from "typeorm";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { Breed } from "./Breed";
import { Booking } from "./Booking";
import {IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Validate} from "class-validator";
import {HasPetWithName, UserHasOwnerRole} from "../custom_validation/PetCustomValidation";

/**
 * Enum representing various temperaments a pet can have.
 *
 * @readonly
 * @enum {string}
 */
export enum Temperament {
    F = "FRIENDLY",
    A = "AGGRESSIVE"
}

/**
 * Enum representing possible statuses of a pet.
 *
 * @readonly
 * @enum {string}
 */
export enum PetStatus {
    A = "ACTIVE",
    D = "DELETED"
}

/**
 * Enum representing possible genders of a pet.
 *
 * @readonly
 * @enum {string}
 */
export enum PetGender {
    F = "F",
    M = "M"
}

/**
 * Enum representing possible sizes of a pet.
 *
 * @readonly
 * @enum {string}
 */
export enum PetSize {
    S = "S",
    M = "M",
    L = "L"
}

/**
 * Interface representing the structure of a pet data object.
 *
 * @interface
 */
export interface PetData {
    id : string,
    createdAt: Date,
    updatedAt: Date,
    name: string,
    birthdate: Date,
    size: string,
    gender: string,
    temperament: string,
    description: string,
    status: string,
    image_path?: string | null,
    owner: object,
    breed: object,
}

/**
 * Entity representing a pet.
 *
 * Extends `BaseModel` to inherit common fields and methods.
 *
 * @extends BaseModel
 * @entity
 * @unique ['user', 'name']
 */
@Entity()
@Unique(['user', 'name'])
export class Pet extends BaseModel {

    /**
     * The name of the pet.
     *
     * Must be a non-empty string and is validated with custom rules.
     *
     * @type {string}
     */
    @Column({type: "varchar", length: 50})
    @IsNotEmpty({message: "Must specify pet name"})
    @IsString({message: "Pet name must be a string"})
    @Validate(HasPetWithName)
    name!: string;

    /**
     * The birthdate of the pet.
     *
     * Must be a non-empty date.
     *
     * @type {Date}
     */
    @Column({ type: "date", update: false })
    @IsNotEmpty({message: "Must specify pet birthdate"})
    @IsDate({message: "Invalid birthdate"})
    birthdate!: Date;

    /**
     * The size of the pet.
     *
     * Must be a valid enum value from `PetSize`.
     *
     * @type {string}
     */
    @Column({type: "enum", enum: PetSize})
    @IsNotEmpty()
    @IsString()
    @IsEnum(PetSize)
    size!: string;

    /**
     * The gender of the pet.
     *
     * Must be a valid enum value from `PetGender`.
     *
     * @type {string}
     */
    @Column({
        type: "enum",
        enum: PetGender
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum(PetGender)
    gender!: string;

    /**
     * The temperament of the pet.
     *
     * Optional field with a default value of `Temperament.FRIENDLY`.
     *
     * @type {string}
     */
    @Column({type: "enum", enum: Temperament, default: Temperament.F})
    @IsOptional()
    @IsString()
    @IsEnum(Temperament)
    temperament!: string;

    /**
     * A description of the pet.
     *
     * Must be a non-empty string with a minimum length of 30 characters.
     *
     * @type {string}
     */
    @Column({type: "varchar", length: 1024})
    @IsNotEmpty({message: "Missing description"})
    @IsString({message: "Description must be a string"})
    @MinLength(30)
    description!: string;

    /**
     * The status of the pet.
     *
     * Optional field with a default value of `PetStatus.ACTIVE`.
     *
     * @type {string}
     */
    @Column({type: "enum", enum: PetStatus, default: PetStatus.A})
    @IsOptional()
    @IsString()
    @IsEnum(PetStatus)
    status!: string;

    /**
     * Path to an image of the pet.
     *
     * Optional field which may be null.
     *
     * @type {string | null}
     */
    @Column({type : 'varchar', length: 255, nullable: true})
    @IsOptional()
    image_path?: string | null;

    /**
     * The bookings associated with this pet.
     *
     * Optional field representing many-to-many relationship with `Booking`.
     *
     * @type {Booking[]}
     */
    @ManyToMany(
        () => Booking,
        (booking : Booking) => booking.pets
    )
    @IsOptional()
    bookings!: Booking[];

    /**
     * The user who owns this pet.
     *
     * Must be a valid user and is validated with custom rules.
     *
     * @type {User}
     */
    @ManyToOne(
        () => User,
        (user : User) => user.pets
    )
    @JoinColumn({name: "user_id"})
    @IsNotEmpty()
    @Validate(UserHasOwnerRole)
    user!: User;

    /**
     * The breed of the pet.
     *
     * Must be a valid breed.
     *
     * @type {Breed}
     */
    @ManyToOne(
        () => Breed,
        (breeds : Breed) => breeds.pets
    )
    @JoinColumn({name: "breed_id"})
    @IsNotEmpty()
    breed!: Breed;


    /**
     * Converts the pet name to lowercase before inserting or updating.
     *
     * @method
     */
    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.name = this.name.toLowerCase();
    }

    /**
     * Converts the birthdate to a `Date` object after loading.
     *
     * @method
     */
    @AfterLoad()
    transform() {
        this.birthdate = new Date(this.birthdate);
    }
}
