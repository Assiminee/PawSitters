import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseModel } from "./BaseModel";
import { Species } from "./Species";
import { Pet } from "./Pet";

@Entity()
export class Breed extends BaseModel {
    constructor() {
        super();
        this.name = '';
        this.species = null;
    }

    @Column("varchar", {length: 45})
    name: string

    @ManyToOne(
        () => Species,
        (species : Species) => species.breeds
    )
    @JoinColumn({name: "species_id"})
    species: Species | null;

    @OneToMany(
        () => Pet,
        (pet) => pet.breed
    )
    pets!: Pet[];
}
