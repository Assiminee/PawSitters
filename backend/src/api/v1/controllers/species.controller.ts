import {BaseController} from "./base.controller";
import {Species} from "../../../orm/entities/Species";

export class SpeciesController extends BaseController<Species> {
    constructor() {
        super(Species);
        this.entityColumns.required_columns = ['name'];
        this.entityColumns.unique_columns = ['name'];
    }

    public getSpecies = async () => {
        const species = await Species.find({
            relations: ["breeds", "breeds.pets"]
        });

        return species.map(spec => {
            return {
                ...spec, breeds: spec.breeds.map(breed => {
                    return {...breed, pets: breed.pets.length}
                })
            }
        });
    }

    public getOneSpecies = async (spec_id: string) => {
        const species = await this.getEntityById(spec_id, ["breeds", "breeds.pets"]);


        return {
            ...species, breeds: species.breeds.map(breed => {
                    return {...breed, pets: breed.pets.length};
                }
            )
        };
    }
}