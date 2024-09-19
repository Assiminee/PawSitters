import {BaseController} from "./base.controller";
import {Breed} from "../../../orm/entities/Breed";
import {Species} from "../../../orm/entities/Species";
import {AppError, ConflictError, NotFoundError} from "../errors/Errors";

/**
 * BreedController class extends BaseController to manage Breed-related operations.
 */
export class BreedController extends BaseController<Breed> {
    constructor() {
        super(Breed);

        // Specifies the required and unique columns for breeds
        this.entityColumns.required_columns = ['name'];
        this.entityColumns.unique_columns = ['name'];
        this.entityColumns.allowed_columns= ['name'];
    }

    /**
     * Retrieves a breed by its ID from a species.
     *
     * @param {Species} species - The species that the breed belongs to.
     * @param {string} breed_id - The ID of the breed to retrieve.
     * @returns the breed found.
     * @throws {NotFoundError} - If the species has no breeds or the breed is not found.
     */
    public getBreedById = async (species: Species, breed_id: string) => {
        if (!species.breeds)
            throw new NotFoundError(`The species ${species.name}, has no breeds`, {});

        // Find the breed in the species' breeds list
        const breedFound = species.breeds.find((breed) => breed.id == breed_id);

        if (!breedFound)
            throw new NotFoundError(`Breed not found`, {not_found: breed_id});

        return breedFound;
    }

    /**
     * Creates a new breed for a given species.
     *
     * @param {Species} species - The species to which the breed will be assigned.
     * @param {object} data - The breed data to be created.
     * @returns the created breed.
     * @throws {AppError} - If breed creation fails.
     */
    public createBreed = async (species: Species, data: object) => {
        this.checkData(data);
        await this.hasExistingData(data);

        // Ensure that species is not set manually in the data
        if ('species' in data) {
            this.appendInvalidData({species : "Can't manually set the species"});
            delete data.species;
        }

        // Add species to the breed data
        data = {...data, species: species}
        const breed = this.repository.create(data);

        // Validate the created breed
        await this.propertyValidation(breed, "Couldn't create breed");

        // Save the breed to the database
        return this.repository.save(breed);
    }

    /**
     * Deletes a breed from a species if no pets of that breed exist.
     *
     * @param {Species} species - The species to which the breed belongs.
     * @param {string} breed_id - The ID of the breed to delete.
     * @throws {NotFoundError} - If the breed is not found.
     * @throws {ConflictError} - If there are pets of this breed.
     * @throws {AppError} - If the breed cannot be deleted.
     */
    public deleteBreed = async (species: Species, breed_id: string) => {
        // Find the breed in the species' breeds list
        const breed = species.breeds
            .find((speciesBreed) => speciesBreed.id === breed_id);

        if (!breed)
            throw new NotFoundError(`Breed not found for species '${species.name}'`,
                {failed: "delete", reason: "Invalid breed id"});

        // Prevent deletion if there are pets associated with the breed
        if (breed.pets && breed.pets.length > 0)
            throw new ConflictError(
                `Cannot delete breed '${breed.name}'`,
                {failed: "delete", reason: "Pets of this breed exist."}
            );

        // Delete the breed from the database
        const deleteResult = await this.repository.delete({id: breed_id});

        // If the delete operation affected no rows, throw an error
        if (deleteResult.affected === 0)
            throw new AppError("Couldn't delete breed", 500,
                {failed: 'delete', reason: 'Unknown'}
            );
    }

    /**
     * Updates a breed's information for a given species.
     *
     * @param {Species} species - The species that the breed belongs to.
     * @param {string} breed_id - The ID of the breed to update.
     * @param {object} data - The updated breed data.
     * @returns the updated breed with the number of associated pets.
     * @throws {NotFoundError} - If the breed is not found.
     * @throws {ConflictError} - If pets exist for the breed.
     * @throws {AppError} - If breed update fails.
     */
    public updateBreed = async (species: Species, breed_id: string, data: object) => {
        // Find the breed in the species' breeds list
        const breed = species.breeds
            .find((speciesBreed) => speciesBreed.id === breed_id);

        if (!breed)
            throw new NotFoundError(`Breed not found for species ${species.name}`,
                {failed: "update", reason: "Invalid breed id"});

        // Prevent update if pets exist for the breed
        if (breed.pets && breed.pets.length > 0)
            throw new ConflictError(
                `Cannot update breed '${breed.name}'`,
                {failed: "update", reason: "Pets of this breed exist."}
            );

        this.checkData(data);
        await this.hasExistingData(data);

        // Ensure that species is not set manually in the data
        if ('species' in data) {
            this.appendInvalidData({species : "Can't manually set the species"});
            delete data.species;
        }

        // Update breed properties
        this.updateProperties(breed, data);

        // Validate the updated breed
        await this.propertyValidation(breed, "Couldn't update breed");

        // Save the updated breed and return it along with the count of associated pets
        const savedBreed = await this.repository.save(breed);
        return {
            ...savedBreed,
            pets: savedBreed.pets.length
        };
    }
}