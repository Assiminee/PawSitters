import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { Breed } from "./Breed";
import { PetImage } from "./PetImage";
import { Booking } from "./Booking";

export enum Temperament {
    F = "Friendly",
    A = "Aggressive"
}

export enum PetStatus {
    A = "Active",
    D = "Deleted"
}

export enum PetGender {
    F = "Female",
    M = "Male"
}
@Entity()
export class Pet extends BaseModel {
    constructor() {
        super();
        this.birth_date = null;
        this.breed = null;
        this.user = null;
        this.status = '';
        this.description = '';
        this.temperament = '';
        this.gender = '';
        this.name = '';
        this.size = 0.00;
    }

    @Column({type: "varchar", length: 50})
    name: string;

    @Column({ type: "date", update: false })
    birth_date: Date | null;

    @Column({type: "decimal", precision: 5, scale: 2})
    size: number;

    @Column({
        type: "enum",
        enum: PetGender
    })
    gender: string;

    @Column({type: "enum", enum: Temperament})
    temperament: string;

    @Column({type: "varchar", length: 1024})
    description: string;

    @Column({type: "enum", enum: PetStatus})
    status: string;

    @OneToMany(
        () => PetImage,
        (petImages : PetImage) => petImages.pet
    )
    images!: PetImage[];

    @ManyToMany(
        () => Booking,
        (booking : Booking) => booking.pets
    )
    bookings!: Booking[];

    @ManyToOne(
        () => User,
        (user : User) => user.pets
    )
    @JoinColumn({name: "user_id"})
    user: User | null;

    @ManyToOne(
        () => Breed,
        (breeds : Breed) => breeds.pets
    )
    @JoinColumn({name: "breed_id"})
    breed: Breed | null;
}
