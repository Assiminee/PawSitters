import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Pet} from "../entities/Pet";

@ValidatorConstraint({ name: 'hasPetWithName', async: false })
export class HasPetWithName implements ValidatorConstraintInterface {
    validate(name: any | null, args: ValidationArguments) {
        const currentPet: Pet = args.object as Pet;
        const hasPetWithName = currentPet.user.pets.some(pet =>
            pet.name.toLowerCase() === name.toLowerCase()
        );

        return !hasPetWithName;
    }

    defaultMessage(args: ValidationArguments) {
        return 'A user cannot have multiple pets of the same name.';
    }
}