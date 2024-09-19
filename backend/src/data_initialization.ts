import {AppDataSource} from "./orm/data-source";
import {Role} from "./orm/entities/Role";
import {Species} from "./orm/entities/Species";
import {Breed} from "./orm/entities/Breed";

// Function to create default roles in the database
const createRoles = async () => {
    if (!AppDataSource.hasMetadata(Role))
        return;

    const roles = ["ADMIN", "OWNER", "SITTER"];
    const roleRepository = AppDataSource.getRepository(Role);

    for (const role of roles) {
        const exists = await roleRepository.existsBy({role : role});
        if (!exists) {
            const newRole = roleRepository.create({role : role});
            const savedRole = await roleRepository.save(newRole);
            console.log(savedRole);
        }
    }
}

// Function to create species and their associated breeds in the database
const createSpecies = async () => {
    if (!AppDataSource.hasMetadata(Species) || !AppDataSource.hasMetadata(Breed))
        return;

    const species = {
        CAT : [
            "Persian", "Maine Coon", "Siamese",
            "Bengal", "Sphynx", "Ragdoll",
            "British Shorthair", "Scottish Fold",
            "Abyssinian"
        ],
        DOG : [
            "Labrador Retriever","German Shepherd",
            "Golden Retriever", "Bulldog", "Poodle",
            "Beagle", "French Bulldog", "Siberian Husky",
            "Dachshund", "Boxer"
        ]

    }
    const speciesRep = AppDataSource.getRepository(Species);

    for (const [spec, breeds] of Object.entries(species)) {
        const exists = await speciesRep.existsBy({name : spec});
        if (!exists) {
            const newSpecies = speciesRep.create({name : spec});
            newSpecies.breeds = [];

            for (const breed of breeds) {
                const newBreed = new Breed();
                newBreed.name = breed.toLowerCase();
                newSpecies.breeds.push(newBreed);
            }

            const savedSpec = await speciesRep.save(newSpecies);
            console.log(savedSpec);
        }
    }
}

// Initialization function to create roles and species
export const init = async () => {
    await createRoles(); // Call the function to create roles
    await createSpecies(); // Call the function to create species
}