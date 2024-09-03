import {Entity, Column, ManyToOne, JoinColumn, Unique} from "typeorm";
import { Pet } from "./Pet";
import { BaseModel } from "./BaseModel";
import {IsNotEmpty, IsString} from "class-validator";

@Entity()
@Unique(['image_path'])
export class PetImage extends BaseModel {
    @Column({type: "varchar", length: 255})
    @IsNotEmpty({message: "Missing pet image path"})
    @IsString({message: "Pet image path must be a string"})
    image_path!: string;

    @ManyToOne(() => Pet, (pet) => pet.images)
    @JoinColumn({name: "pet_id"})
    @IsNotEmpty()
    pet!: Pet;
}
