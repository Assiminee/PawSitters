import {isPhoneNumber, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {User} from "../entities/User";

/**
 * Custom validation constraint to ensure the phone number is valid
 * for either Ghanaian or Moroccan formats.
 */
@ValidatorConstraint({ name: 'isValidRole', async: false })
export class IsValidPhone implements ValidatorConstraintInterface {

    /**
     * Validates the phone number.
     * @param phone - The phone number to validate.
     * @param args - Validation arguments (not used here).
     * @returns true if the phone number is valid for Ghana or Morocco, otherwise false.
     */
    validate(phone: string, args: ValidationArguments) {
        return (isPhoneNumber(phone, 'GH') || isPhoneNumber(phone, 'MA'))
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments (not used here).
     * @returns The default error message.
     */
    defaultMessage(args: ValidationArguments) {
        return 'The phone number must be a valid Ghanaian or Moroccan number';
    }
}

/**
 * Custom validation constraint to ensure that a fee is only provided
 * if the user has the "SITTER" role.
 */
@ValidatorConstraint({ name: 'isSitterFeeValid', async: false })
export class IsSitterFeeValidConstraint implements ValidatorConstraintInterface {

    /**
     * Validates whether the fee is provided correctly based on the user's role.
     * @param fee - The fee to validate.
     * @param args - Validation arguments which include the user object.
     * @returns true if the user has the "SITTER" role and the fee is valid, otherwise false.
     */
    validate(fee: any | null, args: ValidationArguments) {
        fee = Number(fee);
        const user: User = args.object as User;

        if (!user.role)
            return false;

        const hasSitterRole = user.role.role === "SITTER";

        return !(!hasSitterRole && fee !== null);
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments (not used here).
     * @returns The default error message.
     */
    defaultMessage(args: ValidationArguments) {
        return 'Fee can only be provided if the user has the role Sitter.';
    }
}

/**
 * Custom validation constraint to ensure the user is at least 18 years old.
 */
@ValidatorConstraint({name: 'isAdult', async: false})
export class IsAdult implements ValidatorConstraintInterface {

    /**
     * Validates whether the user is an adult based on their birthdate.
     * @param birthday - The user's birthdate.
     * @param args - Validation arguments (not used here).
     * @returns true if the user is 18 years old or older, otherwise false.
     */
    validate(birthday : any, args: ValidationArguments){
        birthday = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const hasBirthdayPassedThisYear =
            today.getMonth() > birthday.getMonth() ||
            (today.getMonth() === birthday.getMonth() && today.getDate() >= birthday.getDate());

        if (!hasBirthdayPassedThisYear) {
            age--;
        }
        return age >= 18;
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments (not used here).
     * @returns The default error message.
     */
    defaultMessage(args: ValidationArguments) {
        return 'User must be an adult';
    }
}

