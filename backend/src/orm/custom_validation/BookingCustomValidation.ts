import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Booking} from "../entities/Booking";
import {User} from "../entities/User";

@ValidatorConstraint({ name: 'hasOwnerRole', async: false })
export class HasOwnerRole implements ValidatorConstraintInterface {
    validate(owner: any | null, args: ValidationArguments) {
        return owner && owner instanceof User && owner.role.role === 'OWNER'
    }

    defaultMessage(args: ValidationArguments) {
        return "Must a user with an 'OWNER' role";
    }
}

@ValidatorConstraint({ name: 'hasSitterRole', async: false })
export class HasSitterRole implements ValidatorConstraintInterface {
    validate(sitter: any | null, args: ValidationArguments) {
        return sitter && sitter instanceof User && sitter.role.role === 'SITTER'
    }

    defaultMessage(args: ValidationArguments) {
        return "Must be a user with a 'SITTER' role";
    }
}

@ValidatorConstraint({ name: 'hasBankAccountNumber', async: false })
export class HasBankAccountNumber implements ValidatorConstraintInterface {
    validate(user: any | null, args: ValidationArguments) {
        return user && user instanceof User && user.bank_account_number;
    }

    defaultMessage(args: ValidationArguments) {
        return "Must have a bank account number";
    }
}

@ValidatorConstraint({ name: 'hasFeeSpecified', async: false })
export class HasFeeSpecified implements ValidatorConstraintInterface {
    validate(user: any | null, args: ValidationArguments) {
        return user && user instanceof User && user.fee;
    }

    defaultMessage(args: ValidationArguments) {
        return "Must have a fee specified";
    }
}

@ValidatorConstraint({ name: 'inSameCityCountry', async: false })
export class InSameCityCountry implements ValidatorConstraintInterface {
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

    defaultMessage(args: ValidationArguments) {
        return "Sitter and owner must have valid addresses and be in the same country/city";
    }
}

@ValidatorConstraint({ name: "isValidInterval", async: false })
export class IsValidInterval implements ValidatorConstraintInterface {
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

    defaultMessage(args: ValidationArguments): string {
        return "Date interval must be at least one day long and the start date must be at least the day after today.";
    }
}