import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique} from "typeorm";
import { BaseModel } from "./BaseModel";
import { Species } from "./Species";
import { Pet } from "./Pet";
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

@Entity()
@Unique(['name'])
export class Breed extends BaseModel {
    @Column("varchar", {length: 45})
    @IsNotEmpty()
    @IsString()
    name!: string

    @ManyToOne(
        () => Species,
        (species : Species) => species.breeds
    )
    @JoinColumn({name: "species_id"})
    @IsNotEmpty()
    species!: Species;

    @OneToMany(
        () => Pet,
        (pet) => pet.breed
    )
    @IsOptional()
    pets!: Pet[];

    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.name = this.name.toLowerCase();
    }

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
