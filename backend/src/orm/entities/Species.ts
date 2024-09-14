import {Column, Entity, OneToMany, Unique} from "typeorm";
import { BaseModel } from "./BaseModel";
import { Breed } from "./Breed";
import {IsEnum, IsNotEmpty, IsOptional, IsString, Validate} from "class-validator";
import {EnsureUniqueBreedsPerSpecies} from "../custom_validation/SpeciesCustomValidation";

export enum SpeciesName {
    C = "CAT",
    D = "DOG"
}

@Entity()
@Unique(['name'])
export class Species extends BaseModel {
    @Column({type: "enum", enum: SpeciesName})
    @IsNotEmpty({message: "Missing name for species"})
    @IsString({message: "Species name must be a string. Options: CAT, DOG"})
    @IsEnum(SpeciesName)
    name!: string;

    @OneToMany(
        () => Breed,
        (breeds) => breeds.species,
        {cascade : true}
    )
    @IsOptional()
    @Validate(EnsureUniqueBreedsPerSpecies)
    breeds!: Breed[];
}
