import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Booking} from "../entities/Booking";
import {User} from "../entities/User";

/**
 * Custom validation constraint to ensure that a user has the 'OWNER' role.
 */
@ValidatorConstraint({ name: 'hasOwnerRole', async: false })
export class HasOwnerRole implements ValidatorConstraintInterface {

    /**
     * Validates whether the provided user has the 'OWNER' role.
     * @param owner - The user to validate.
     * @param args - Validation arguments.
     * @returns true if the user has the 'OWNER' role, otherwise false.
     */
    validate(owner: any | null, args: ValidationArguments) {
        return owner && owner instanceof User && owner.role.role === 'OWNER'
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for the role check.
     */
    defaultMessage(args: ValidationArguments) {
        return "Must a user with an 'OWNER' role";
    }
}

/**
 * Custom validation constraint to ensure that a user has the 'SITTER' role.
 */
@ValidatorConstraint({ name: 'hasSitterRole', async: false })
export class HasSitterRole implements ValidatorConstraintInterface {

    /**
     * Validates whether the provided user has the 'SITTER' role.
     * @param sitter - The user to validate.
     * @param args - Validation arguments.
     * @returns true if the user has the 'SITTER' role, otherwise false.
     */
    validate(sitter: any | null, args: ValidationArguments) {
        return sitter && sitter instanceof User && sitter.role.role === 'SITTER'
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for the role check.
     */
    defaultMessage(args: ValidationArguments) {
        return "Must be a user with a 'SITTER' role";
    }
}

/**
 * Custom validation constraint to ensure that a user has a bank account number.
 */
@ValidatorConstraint({ name: 'hasBankAccountNumber', async: false })
export class HasBankAccountNumber implements ValidatorConstraintInterface {

    /**
     * Validates whether the provided user has a bank account number.
     * @param user - The user to validate.
     * @param args - Validation arguments.
     * @returns true if the user has a bank account number, otherwise false.
     */
    validate(user: any | null, args: ValidationArguments) {
        return user && user instanceof User && user.bank_account_number;
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for the bank account number check.
     */
    defaultMessage(args: ValidationArguments) {
        return "Must have a bank account number";
    }
}

/**
 * Custom validation constraint to ensure that a user has a fee specified.
 */
@ValidatorConstraint({ name: 'hasFeeSpecified', async: false })
export class HasFeeSpecified implements ValidatorConstraintInterface {

    /**
     * Validates whether the provided user has a fee specified.
     * @param user - The user to validate.
     * @param args - Validation arguments.
     * @returns true if the user has a fee specified, otherwise false.
     */
    validate(user: any | null, args: ValidationArguments) {
        return user && user instanceof User && user.fee;
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for the fee specification check.
     */
    defaultMessage(args: ValidationArguments) {
        return "Must have a fee specified";
    }
}

/**
 * Custom validation constraint to ensure that a sitter and owner are in the same city and country.
 */
@ValidatorConstraint({ name: 'inSameCityCountry', async: false })
export class InSameCityCountry implements ValidatorConstraintInterface {

    /**
     * Validates whether the sitter and owner are in the same city and country.
     * @param sitter - The sitter to validate.
     * @param args - Validation arguments which include the current booking object.
     * @returns true if both the sitter and owner have the same city and country, otherwise false.
     */
    validate(sitter: any | null, args: ValidationArguments) {
        const booking : Booking = args.object as Booking;
        const owner = booking.owner;

        return (
            sitter && sitter instanceof User &&
            owner && owner instanceof User &&
            owner.address && sitter.address &&
            owner.address.city === sitter.address.city &&
            owner.address.country === sitter.address.country
        )
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for the city/country check.
     */
    defaultMessage(args: ValidationArguments) {
        return "Sitter and owner must have valid addresses and be in the same country/city";
    }
}

/**
 * Custom validation constraint to ensure that the booking interval is valid.
 */
@ValidatorConstraint({ name: "isValidInterval", async: false })
export class IsValidInterval implements ValidatorConstraintInterface {

    /**
     * Validates whether the end date is at least one day after the start date and the start date is at least the day after today.
     * @param end_date - The end date to validate.
     * @param args - Validation arguments which include the current booking object.
     * @returns true if the interval is valid, otherwise false.
     */
    validate(end_date: any | null, args: ValidationArguments): boolean {
        const booking: Booking = args.object as Booking;

        if (!end_date || !(end_date instanceof Date) || !booking.start_date || !(booking.start_date instanceof Date))
            return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextDay = new Date(today);
        nextDay.setDate(nextDay.getDate() + 1);

        if (booking.start_date.getTime() < nextDay.getTime())
            return false;

        const oneDayAfterStart = new Date(booking.start_date);
        oneDayAfterStart.setDate(booking.start_date.getDate() + 1);

        return end_date.getTime() >= oneDayAfterStart.getTime();
    }

    /**
     * Returns the error message if validation fails.
     * @param args - Validation arguments.
     * @returns The default error message for the date interval check.
     */
    defaultMessage(args: ValidationArguments): string {
        return "Date interval must be at least one day long and the start date must be at least the day after today.";
    }
}