import {Column, Entity, OneToMany, Unique} from "typeorm";
import { BaseModel } from "./BaseModel";
import { Breed } from "./Breed";
import {IsEnum, IsNotEmpty, IsOptional, IsString, Validate} from "class-validator";
import {EnsureUniqueBreedsPerSpecies} from "../custom_validation/SpeciesCustomValidation";

/**
 * Enum representing species names.
 */
export enum SpeciesName {
    C = "CAT",  // Cat species
    D = "DOG"   // Dog species
}

/**
 * Entity representing a species.
 *
 * This entity defines different species and their associated breeds.
 * Each species must have a unique name and can have multiple breeds.
 *
 * @extends BaseModel
 * @entity
 */
@Entity()
@Unique(['name'])
export class Species extends BaseModel {

    /**
     * The name of the species.
     *
     * Must be a valid enum value from the `SpeciesName` enum and cannot be empty.
     *
     * @type {string}
     */
    @Column({type: "enum", enum: SpeciesName})
    @IsNotEmpty({message: "Missing name for species"})
    @IsString({message: "Species name must be a string. Options: CAT, DOG"})
    @IsEnum(SpeciesName)
    name!: string;

    /**
     * The breeds associated with this species.
     *
     * One-to-many relationship with the `Breed` entity.
     *
     * @type {Breed[]}
     */
    @OneToMany(
        () => Breed,
        (breeds) => breeds.species,
        {cascade : true}
    )
    @IsOptional()
    @Validate(EnsureUniqueBreedsPerSpecies)
    breeds!: Breed[];
}
