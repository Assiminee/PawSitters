import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Pet} from "../entities/Pet";

@ValidatorConstraint({ name: 'hasPetWithName', async: false })
export class HasPetWithName implements ValidatorConstraintInterface {
    validate(name: any | null, args: ValidationArguments) {
        if (!name)
            return true;

        const currentPet: Pet = args.object as Pet;
        const hasPetWithName = currentPet.user.pets.some(
            pet => pet.id !== currentPet.id && pet.name.toLowerCase() === currentPet.name.toLowerCase()
        )

        return !hasPetWithName;
    }

    defaultMessage(args: ValidationArguments) {
        return 'A user cannot have multiple pets of the same name.';
    }
}

@ValidatorConstraint({ name: 'userHasOwnerRole', async: false })
export class UserHasOwnerRole implements ValidatorConstraintInterface {
    validate(user: any | null, args: ValidationArguments) {
        const currentPet: Pet = args.object as Pet;
        return currentPet.user.role.role === "OWNER";
    }

    defaultMessage(args: ValidationArguments) {
        return "Only users with role 'OWNER' can have pets";
    }
}