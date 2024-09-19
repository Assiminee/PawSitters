import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique} from "typeorm";
import { BaseModel } from "./BaseModel";
import { Species } from "./Species";
import { Pet } from "./Pet";
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

/**
 * Entity representing a breed of pet.
 *
 * Extends `BaseModel` to inherit common fields and methods.
 *
 * @extends BaseModel
 * @entity
 */
@Entity()
@Unique(['name'])
export class Breed extends BaseModel {

    /**
     * The name of the breed.
     *
     * Must be a non-empty string and is unique across all breeds.
     *
     * @type {string}
     */
    @Column("varchar", {length: 45})
    @IsNotEmpty()
    @IsString()
    name!: string

    /**
     * The species to which the breed belongs.
     *
     * References the `Species` entity with a many-to-one relationship.
     *
     * @type {Species}
     */
    @ManyToOne(
        () => Species,
        (species : Species) => species.breeds
    )
    @JoinColumn({name: "species_id"})
    @IsNotEmpty()
    species!: Species;

    /**
     * Pets that belong to this breed.
     *
     * References the `Pet` entity with a one-to-many relationship.
     *
     * @type {Pet[]}
     * @optional
     */
    @OneToMany(
        () => Pet,
        (pet) => pet.breed
    )
    @IsOptional()
    pets!: Pet[];

    /**
     * Converts the breed name to lowercase before inserting or updating in the database.
     */
    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.name = this.name.toLowerCase();
    }

    /**
     * Provides minimal information about the breed.
     */
    getMinimalInfo() {
        return {
            id: this.id,
            name: this.name,
            species: {
                id: this.species.id,
                name: this.species.name
            }
        }
    }
}
