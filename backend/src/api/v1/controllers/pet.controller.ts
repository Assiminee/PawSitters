import {BaseController} from "./base.controller";
import {Pet, PetData} from "../../../orm/entities/Pet";
import {User} from "../../../orm/entities/User";
import {Breed} from "../../../orm/entities/Breed";
import {AppError, ForbiddenRequest, NotFoundError} from "../errors/Errors";
import {UserController} from "./user.controller";

/**
 * PetController class extends BaseController to manage Pet-related operations.
 */
export class PetController extends BaseController<Pet> {
    constructor() {
        super(Pet);

        // Define columns that can be updated in the Pet entity
        this.entityColumns.updatable_columns = [
            "name", "size", "description", "temperament", "image_path"
        ];

        // Define columns allowed in create/update operations
        this.entityColumns.allowed_columns = [
            "name", "size", "description", "temperament",
            "birthdate", "gender", "breed", "image_path"
        ];

        // Define required columns that must be present when creating a Pet
        this.entityColumns.required_columns = [
            "name", "size", "description",
            "birthdate", "gender", "breed"
        ];
    }

    /**
     * Transforms a Pet entity into a PetData object.
     * @param pet - The Pet entity to be transformed.
     * @returns An object containing the necessary pet data.
     */
    public getPetData = (pet : Pet) : PetData => {
        return {
            id: pet.id,
            createdAt: pet.createdAt,
            updatedAt: pet.updatedAt,
            name: pet.name,
            birthdate: pet.birthdate,
            size: pet.size,
            gender: pet.gender,
            temperament: pet.temperament,
            description: pet.description,
            status: pet.status,
            image_path: pet.image_path,
            owner: pet.user.getMinimalInfo(),
            breed: pet.breed.getMinimalInfo()
        };
    }

    /**
     * Checks if a pet exists for a given user.
     * @param pet_id - The ID of the pet.
     * @param user_id - The ID of the user who owns the pet.
     * @throws NotFoundError if the user or pet is not found.
     */
    private petExists = async (pet_id: string, user_id : string) => {
        // Check if the user exists
        const userExists = await User.existsBy({id : user_id});

        if (!userExists)
            throw new NotFoundError("User not found", {not_found : user_id});

        // Check if the pet exists for the user
        const petExists = await this.repository.existsBy({
            id : pet_id,
            user : { id : user_id }
        });

        if (!petExists)
            throw new NotFoundError("Pet not found", {not_found : pet_id});
    }

    /**
     * Retrieves all pets owned by a given user.
     * @param user_id - The ID of the user.
     * @returns A list of pet data objects.
     * @throws NotFoundError if the user does not own pets or is not an owner.
     */
    public findPets = async (user_id : string) => {
        // Retrieve the user and their pets
        const user = await (new UserController())
            .getEntityById(user_id, ['pets', 'pets.breed', 'pets.breed.species', 'pets.user', 'role']);

        // Only users with the role "OWNER" can have pets
        if (user.role.role !== "OWNER")
            throw new NotFoundError(
                `Pets not found`,
                {not_found : `Users with the role ${user.role.role} don't have pets`}
                )

        // Map each pet to its data representation
        return user.pets.map(pet => this.getPetData(pet));
    }

    /**
     * Finds a specific pet owned by a user.
     * @param pet_id - The ID of the pet.
     * @param user_id - The ID of the user who owns the pet.
     * @returns The Pet entity.
     * @throws NotFoundError if the pet does not exist.
     */
    public findPetById = async (pet_id : string, user_id : string) => {
        // Check if the pet exists for the user
        await this.petExists(pet_id, user_id);

        // Find and return the pet
        return this.repository.findOneOrFail({
            where : {
                id : pet_id,
                user : { id : user_id }
            },
            relations : ['user', 'breed', 'breed.species']
        });
    }

    /**
     * Checks and removes forbidden data from the request object.
     * @param data - The request data.
     * @param key - The key to check for.
     */
    private checkForbiddenData = (data: object, key: string) => {
        if (!(key in data))
            return;

        // Append invalid data to the error handler
        this.appendInvalidData({[key]: `Can't manually set ${key}`});

        // Delete forbidden key from the data
        delete (data as any)[key];
    }

    /**
     * Sets the breed for the pet being created.
     * @param data - The request data containing breed information.
     * @throws NotFoundError if the breed is not found.
     */
    private setBreed = async (data: object) => {
        // Check if the breed is provided
        if (!('breed' in data)) {
            this.appendMissingData('breed');
            return null;
        }

        // Ensure breed is a string and exists
        if (typeof data.breed !== 'string')
            throw new NotFoundError(
                `Breed ${data.breed} was not found`,
                {not_found: data.breed}
            );

        // Find the breed in the database
        const breed = await Breed.findOne({
            where: {name: data.breed},
            relations: ['species']
        });

        // Throw an error if breed is not found
        if (!breed)
            throw new NotFoundError(
                `Breed ${data.breed} was not found`,
                {not_found: data.breed}
            );

        // Set the breed in the request data
        data.breed = breed;
    }

    /**
     * Converts certain string fields (e.g., size, gender, temperament) to uppercase for consistency.
     * @param data - The request data.
     */
    private checkEnums = (data: object) => {
        if ('size' in data && typeof data.size === 'string')
            data.size = data.size.toUpperCase();

        if ('gender' in data && typeof data.gender === 'string')
            data.gender = data.gender.toUpperCase();

        if ('temperament' in data && typeof data.temperament === 'string')
            data.temperament = data.temperament.toUpperCase();
    }

    /**
     * Creates a new pet for a user with the role 'OWNER'.
     * @param data - The pet data.
     * @param user - The user creating the pet.
     * @returns The newly created pet data.
     * @throws ForbiddenRequest if the user is not an owner.
     */
    public createPet = async (data: object, user: User) => {
        // Ensure the user has the "OWNER" role
        if (user.role.role !== "OWNER")
            throw new ForbiddenRequest(
                "Only users with the role 'OWNER' cat have pets.",
                {failed : 'create', reason : 'Required role missing'}
            );

        // Validate and process the data
        this.checkData(data);
        await this.setBreed(data);
        this.checkForbiddenData(data, 'status');
        this.checkForbiddenData(data, 'user');
        this.checkDate(data, "birthdate");
        this.checkEnums(data);

        // Set the user for the pet
        data = {...data, user: user};

        // Create and save the pet
        const pet = this.repository.create(data);
        await this.propertyValidation(pet, "Couldn't creat pet");
        const savedPet = await this.repository.save(pet);
        return this.getPetData(savedPet);
    }

    /**
     * Edits a pet's information.
     * @param data - The updated pet data.
     * @param user_id - The ID of the user who owns the pet.
     * @param pet_id - The ID of the pet being updated.
     * @returns The updated pet data.
     */
    public editPet = async (data: object, user_id : string, pet_id: string) => {
        // Check if the pet exists for the user
        await this.petExists(pet_id, user_id);

        // Retrieve the pet
        const pet = await this.repository.findOneOrFail({
            where : {
                id : pet_id,
                user : { id : user_id }
            },
            relations : ['user', 'user.role', 'user.pets', 'breed', 'breed.species']
        });

        // Validate and process the update data
        this.forbiddenUpdate(data);
        this.hasInvalidColumns(data);
        await this.hasExistingData(data);
        this.checkEnums(data);
        this.updateProperties(pet, data);

        // Validate and save the updated pet
        await this.propertyValidation(pet, "Couldn't update pet");
        const savedPet = await this.repository.save(pet);
        return this.getPetData(savedPet);
    }

    /**
     * Deletes a pet. If the pet has bookings, its status is set to "DELETED".
     * @param user_id - The ID of the user who owns the pet.
     * @param pet_id - The ID of the pet being deleted.
     * @throws NotFoundError if the pet is not found.
     */
    public deletePet = async (user_id: string, pet_id: string) => {
        // Find the pet and its bookings
        const pet = await this.repository.findOne({
            where: {
                id: pet_id,
                user: {id: user_id}
            },
            relations: ['bookings']
        });

        // If the pet is already deleted or not found, throw an error
        if (!pet || pet.status === "DELETED") {
            throw new NotFoundError("Couldn't delete pet", {not_found: `Invalid pet id ${pet_id}`})
        }

        // If the pet has bookings, mark it as deleted instead of removing it
        if (pet.bookings && pet.bookings.length > 0) {
            pet.status = "DELETED";
            pet.image_path = null;
            await this.repository.save(pet);
            return;
        }

        // Remove the pet from the database
        await this.repository.remove(pet);

        // Check if the pet still exists (in case of failure)
        const exists = await this.repository.existsBy({id: pet_id});
        if (exists)
            throw new AppError("Couldn't delete pet", 500, {failed: "delete", reason: "Unknown"})

    }
}