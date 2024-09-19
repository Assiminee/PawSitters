import {BaseController} from "./base.controller";
import {Species} from "../../../orm/entities/Species";
/**
 * SpeciesController class extends the BaseController to handle Species-related operations.
 */
export class SpeciesController extends BaseController<Species> {
    constructor() {
        super(Species);

        // Define required columns for the Species entity
        this.entityColumns.required_columns = ['name'];

        // Define unique columns to ensure no duplicates
        this.entityColumns.unique_columns = ['name'];
    }

    /**
     * Retrieves all species with related breeds and counts the pets associated with each breed.
     * @returns An array of species with breeds and the number of pets for each breed.
     */
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

    /**
     * Retrieves a single species by its ID along with related breeds and pet count.
     * @param spec_id - The ID of the species to retrieve.
     * @returns The species data including breeds and the number of pets for each breed.
     */
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