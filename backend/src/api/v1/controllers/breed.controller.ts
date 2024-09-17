import {BaseController} from "./base.controller";
import {Breed} from "../../../orm/entities/Breed";
import {Species} from "../../../orm/entities/Species";
import {AppError, ConflictError, NotFoundError} from "../errors/Errors";

export class BreedController extends BaseController<Breed> {
    constructor() {
        super(Breed);
        this.entityColumns.required_columns = ['name'];
        this.entityColumns.unique_columns = ['name'];
        this.entityColumns.allowed_columns= ['name'];
    }

    public getBreedById = async (species: Species, breed_id: string) => {
        if (!species.breeds)
            throw new NotFoundError(`The species ${species.name}, has no breeds`, {});

        const breedFound = species.breeds.find((breed) => breed.id == breed_id);

        if (!breedFound)
            throw new NotFoundError(`Breed not found`, {not_found: breed_id});

        return breedFound;
    }
}