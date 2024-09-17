import {BaseController} from "./base.controller";
import {Pet, PetData} from "../../../orm/entities/Pet";
import {User} from "../../../orm/entities/User";
import {NotFoundError} from "../errors/Errors";
import {UserController} from "./user.controller";

export class PetController extends BaseController<Pet> {
    constructor() {
        super(Pet);
        this.entityColumns.updatable_columns = [
            "name", "size", "description", "temperament", "image_path"
        ];
        this.entityColumns.allowed_columns = [
            "name", "size", "description", "temperament",
            "birthdate", "gender", "breed", "image_path"
        ];
        this.entityColumns.required_columns = [
            "name", "size", "description",
            "birthdate", "gender", "breed"
        ];
        this.entityColumns.unique_columns = ['image_path']
    }

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

    private petExists = async (pet_id: string, user_id : string) => {
        const userExists = await User.existsBy({id : user_id});

        if (!userExists)
            throw new NotFoundError("User not found", {not_found : user_id});

        const petExists = await this.repository.existsBy({
            id : pet_id,
            user : { id : user_id }
        });

        if (!petExists)
            throw new NotFoundError("Pet not found", {not_found : pet_id});
    }

    public findPets = async (user_id : string) => {
        const user = await (new UserController())
            .getEntityById(user_id, ['pets', 'pets.breed', 'pets.breed.species', 'pets.user', 'role']);

        if (user.role.role !== "OWNER")
            throw new NotFoundError(
                `Pets not found`,
                {not_found : `Users with the role ${user.role.role} don't have pets`}
                )

        return user.pets.map(pet => this.getPetData(pet));
    }

    public findPetById = async (pet_id : string, user_id : string) => {
        await this.petExists(pet_id, user_id);

        return this.repository.findOneOrFail({
            where : {
                id : pet_id,
                user : { id : user_id }
            },
            relations : ['user', 'breed', 'breed.species']
        });
    }
}