import {BaseController} from "./base.controller";
import {Species} from "../../../orm/entities/Species";

export class SpeciesController extends BaseController<Species> {
    constructor() {
        super(Species, ['name']);
    }

    public createSpecies = async (data : object) => {
        this.checkData(data);
        await this.hasExistingData(data);

        if ('name' in data && typeof data.name === 'string')
            data.name = data.name.toUpperCase()

        const species = this.repository.create(data);
        await this.propertyValidation(species, 'Could not create species');

        return await this.repository.save(species);
    }
}