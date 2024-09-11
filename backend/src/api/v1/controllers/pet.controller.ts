import {BaseController} from "./base.controller";
import {Pet, PetData} from "../../../orm/entities/Pet";
import {User} from "../../../orm/entities/User";
import {Breed} from "../../../orm/entities/Breed";
import {ForbiddenRequest, NotFoundError} from "../errors/Errors";
import {UserController} from "./user.controller";

export class PetController extends BaseController<Pet> {
    constructor() {
        super(Pet);
        this.entityColumns.updatable_columns = [
            "name", "size", "description", "temperament"
        ];
        this.entityColumns.allowed_columns = [
            "name", "size", "description", "temperament",
            "birthdate", "gender", "breed"
        ];
        this.entityColumns.required_columns = [
            "name", "size", "description",
            "birthdate", "gender", "breed"
        ];
    }

    private getPetData = (pet : Pet) : PetData => {
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

        const pet = await this.repository.findOneOrFail({
            where : {
                id : pet_id,
                user : { id : user_id }
            },
            relations : ['user', 'breed', 'breed.species']
        });
        return this.getPetData(pet);
    }

    private checkForbiddenData = (data: object, key: string) => {
        if (!(key in data))
            return;

        this.appendInvalidData({[key]: `Can't manually set ${key}`});
        delete (data as any)[key];
    }

    private setBreed = async (data: object) => {
        if (!('breed' in data)) {
            this.appendMissingData('breed');
            return null;
        }

        if (typeof data.breed !== 'string')
            throw new NotFoundError(
                `Breed ${data.breed} was not found`,
                {not_found: data.breed}
            );

        const breed = await Breed.findOne({
            where: {name: data.breed},
            relations: ['species']
        });

        if (!breed)
            throw new NotFoundError(
                `Breed ${data.breed} was not found`,
                {not_found: data.breed}
            );

        data.breed = breed;
    }

    private checkEnums = (data: object) => {
        if ('size' in data && typeof data.size === 'string')
            data.size = data.size.toUpperCase();

        if ('gender' in data && typeof data.gender === 'string')
            data.gender = data.gender.toUpperCase();

        if ('temperament' in data && typeof data.temperament === 'string')
            data.temperament = data.temperament.toUpperCase();
    }

    public createPet = async (data: object, user: User) => {
        if (user.role.role !== "OWNER")
            throw new ForbiddenRequest(
                "Only users with the role 'OWNER' cat have pets.",
                {failed : 'create', reason : 'Required role missing'}
            );

        this.checkData(data);
        await this.setBreed(data);
        this.checkForbiddenData(data, 'status');
        this.checkForbiddenData(data, 'user');
        this.checkDate(data, "birthdate");
        this.checkEnums(data);

        data = {...data, user: user};

        const pet = this.repository.create(data);
        await this.propertyValidation(pet, "Couldn't creat pet");
        const savedPet = await this.repository.save(pet);
        return this.getPetData(savedPet);
    }

    public editPet = async (data: object, user_id : string, pet_id: string) => {
        await this.petExists(pet_id, user_id);
        const pet = await this.repository.findOneOrFail({
            where : {
                id : pet_id,
                user : { id : user_id }
            },
            relations : ['user', 'user.role', 'user.pets', 'breed', 'breed.species']
        });

        this.forbiddenUpdate(data);
        this.hasInvalidColumns(data);
        this.checkEnums(data);
        this.updateProperties(pet, data);
        await this.propertyValidation(pet, "Couldn't update pet");
        const savedPet = await this.repository.save(pet);
        return this.getPetData(savedPet);
    }
}