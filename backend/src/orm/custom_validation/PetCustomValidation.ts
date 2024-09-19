import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Pet} from "../entities/Pet";

/**
 * Custom validation constraint to ensure that a user does not have multiple pets with the same name.
 */
@ValidatorConstraint({ name: 'hasPetWithName', async: false })
export class HasPetWithName implements ValidatorConstraintInterface {

    /**
     * Validates whether a pet name is unique for a given user.
     * @param name - The name of the pet to check.
     * @param args - Validation arguments which include the current pet object.
     * @returns true if no other pet with the same name exists for the user, otherwise false.
     */
    validate(name: any | null, args: ValidationArguments) {
        if (!name)
            return true;

        const currentPet: Pet = args.object as Pet;
        const hasPetWithName = currentPet.user.pets.some(
            pet => pet.id !== currentPet.id && pet.name.toLowerCase() === currentPet.name.toLowerCase()
        )

        return !hasPetWithName;
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for duplicate pet names.
     */
    defaultMessage(args: ValidationArguments) {
        return 'A user cannot have multiple pets of the same name.';
    }
}

/**
 * Custom validation constraint to ensure that only users with the 'OWNER' role can have pets.
 */
@ValidatorConstraint({ name: 'userHasOwnerRole', async: false })
export class UserHasOwnerRole implements ValidatorConstraintInterface {

    /**
     * Validates whether the user associated with the pet has the 'OWNER' role.
     * @param user - The user object to check.
     * @param args - Validation arguments which include the current pet object.
     * @returns true if the user has the 'OWNER' role, otherwise false.
     */
    validate(user: any | null, args: ValidationArguments) {
        const currentPet: Pet = args.object as Pet;
        return currentPet.user.role.role === "OWNER";
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for invalid user roles.
     */
    defaultMessage(args: ValidationArguments) {
        return "Only users with role 'OWNER' can have pets";
    }
}