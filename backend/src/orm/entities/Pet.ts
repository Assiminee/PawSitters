import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    Unique
} from "typeorm";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { Breed } from "./Breed";
import { PetImage } from "./PetImage";
import { Booking } from "./Booking";
import {IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Validate} from "class-validator";
import {HasPetWithName, UserHasOwnerRole} from "../custom_validation/PetCustomValidation";

export enum Temperament {
    F = "FRIENDLY",
    A = "AGGRESSIVE"
}

export enum PetStatus {
    A = "ACTIVE",
    D = "DELETED"
}

export enum PetGender {
    F = "F",
    M = "M"
}

export enum PetSize {
    S = "S",
    M = "M",
    L = "L"
}

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
    owner: string,
    owner_id: string,
    breed: string,
    breed_id: string
}

@Entity()
@Unique(['user', 'name'])
export class Pet extends BaseModel {
    @Column({type: "varchar", length: 50})
    @IsNotEmpty({message: "Must specify pet name"})
    @IsString({message: "Pet name must be a string"})
    @Validate(HasPetWithName)
    name!: string;

    @Column({ type: "date", update: false })
    @IsNotEmpty({message: "Must specify pet birthdate"})
    @IsDate({message: "Invalid birthdate"})
    birthdate!: Date;

    @Column({type: "enum", enum: PetSize})
    @IsNotEmpty()
    @IsString()
    @IsEnum(PetSize)
    size!: string;

    @Column({
        type: "enum",
        enum: PetGender
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum(PetGender)
    gender!: string;

    @Column({type: "enum", enum: Temperament, default: Temperament.F})
    @IsOptional()
    @IsString()
    @IsEnum(Temperament)
    temperament!: string;

    @Column({type: "varchar", length: 1024})
    @IsNotEmpty({message: "Missing description"})
    @IsString({message: "Description must be a string"})
    @MinLength(30)
    description!: string;

    @Column({type: "enum", enum: PetStatus, default: PetStatus.A})
    @IsOptional()
    @IsString()
    @IsEnum(PetStatus)
    status!: string;

    @OneToMany(
        () => PetImage,
        (petImages : PetImage) => petImages.pet
    )
    @IsOptional()
    images!: PetImage[];

    @ManyToMany(
        () => Booking,
        (booking : Booking) => booking.pets
    )
    @IsOptional()
    bookings!: Booking[];

    @ManyToOne(
        () => User,
        (user : User) => user.pets
    )
    @JoinColumn({name: "user_id"})
    @IsNotEmpty()
    @Validate(UserHasOwnerRole)
    user!: User;

    @ManyToOne(
        () => Breed,
        (breeds : Breed) => breeds.pets
    )
    @JoinColumn({name: "breed_id"})
    @IsNotEmpty()
    breed!: Breed;

    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.name = this.name.toLowerCase();
    }

    @AfterLoad()
    transform() {
        this.birthdate = new Date(this.birthdate);
    }
}
