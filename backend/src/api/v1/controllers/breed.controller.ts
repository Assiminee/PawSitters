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

    public createBreed = async (species: Species, data: object) => {
        this.checkData(data);
        await this.hasExistingData(data);

        if ('species' in data) {
            this.appendInvalidData({species : "Can't manually set the species"});
            delete data.species;
        }

        data = {...data, species: species}

        const breed = this.repository.create(data);

        await this.propertyValidation(breed, "Couldn't create breed");

        return await this.repository.save(breed);
    }

    public deleteBreed = async (species: Species, breed_id: string) => {
        const breed = species.breeds
            .find((speciesBreed) => speciesBreed.id === breed_id);

        if (!breed)
            throw new NotFoundError(`Breed not found for species '${species.name}'`,
                {failed: "delete", reason: "Invalid breed id"});

        if (breed.pets && breed.pets.length > 0)
            throw new ConflictError(
                `Cannot delete breed '${breed.name}'`,
                {failed: "delete", reason: "Pets of this breed exist."}
            );

        const deleteResult = await this.repository.delete({id: breed_id});

        if (deleteResult.affected === 0)
            throw new AppError("Couldn't delete breed", 500,
                {failed: 'delete', reason: 'Unknown'}
            );
    }

    public updateBreed = async (species: Species, breed_id: string, data: object) => {
        const breed = species.breeds
            .find((speciesBreed) => speciesBreed.id === breed_id);

        if (!breed)
            throw new NotFoundError(`Breed not found for species ${species.name}`,
                {failed: "update", reason: "Invalid breed id"});

        if (breed.pets && breed.pets.length > 0)
            throw new ConflictError(
                `Cannot update breed '${breed.name}'`,
                {failed: "update", reason: "Pets of this breed exist."}
            );

        this.checkData(data);
        await this.hasExistingData(data);

        if ('species' in data) {
            this.appendInvalidData({species : "Can't manually set the species"});
            delete data.species;
        }

        this.updateProperties(breed, data);
        await this.propertyValidation(breed, "Couldn't update breed");
        return await this.repository.save(breed);
    }
}