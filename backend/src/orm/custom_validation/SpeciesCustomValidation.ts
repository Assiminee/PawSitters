import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Species} from "../entities/Species";

@ValidatorConstraint({ name: 'ensureUniqueBreedsPerSpecies', async: false })
export class EnsureUniqueBreedsPerSpecies implements ValidatorConstraintInterface {
    validate(inputBreed: any | null, args: ValidationArguments) {
        const species : Species = args.object as Species;
        const hasBreed = species.breeds.some(breed => breed.name.toLowerCase() === inputBreed);

        return !hasBreed;
    }

    defaultMessage(args: ValidationArguments) {
        return `Duplicate breeds detected for species ${(args.object as Species).name}`;
    }
}