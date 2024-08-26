import { Column, Entity, OneToMany } from "typeorm";
import { BaseModel } from "./BaseModel";
import { Breed } from "./Breed";

export enum SpeciesName {
    B = "Bird",
    C = "Cat",
    D = "Dog"
}

@Entity()
export class Species extends BaseModel {
    constructor() {
        super();
        this.name = '';
    }

    @Column({type: "enum", enum: SpeciesName})
    name: string;

    @OneToMany(
        () => Breed,
        (breeds) => breeds.species
    )
    breeds!: Breed[];
}
