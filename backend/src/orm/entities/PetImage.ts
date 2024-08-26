import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Pet } from "./Pet";
import { BaseModel } from "./BaseModel";

@Entity()
export class PetImage extends BaseModel {
    constructor() {
        super();
        this.imagePath = '';
        this.pet = null;
    }

    @Column({type: "varchar", length: 255, unique: true, name: "image_path"})
    imagePath: string;

    @ManyToOne(() => Pet, (pet) => pet.images)
    @JoinColumn({name: "pet_id"})
    pet: Pet | null;
}
