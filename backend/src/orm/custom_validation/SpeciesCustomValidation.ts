import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Species} from "../entities/Species";

/**
 * Custom validation constraint to ensure that each breed is unique within a species.
 */
@ValidatorConstraint({ name: 'ensureUniqueBreedsPerSpecies', async: false })
export class EnsureUniqueBreedsPerSpecies implements ValidatorConstraintInterface {

    /**
     * Validates whether a breed is unique within the given species.
     * @param inputBreed - The breed name to check for uniqueness.
     * @param args - Validation arguments which include the species object.
     * @returns true if the breed is unique, otherwise false.
     */
    validate(inputBreed: any | null, args: ValidationArguments) {
        const species : Species = args.object as Species;
        const hasBreed = species.breeds.some(breed => breed.name.toLowerCase() === inputBreed);

        return !hasBreed;
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments which include the species object.
     * @returns The default error message including the species name.
     */
    defaultMessage(args: ValidationArguments) {
        return `Duplicate breeds detected for species ${(args.object as Species).name}`;
    }
}