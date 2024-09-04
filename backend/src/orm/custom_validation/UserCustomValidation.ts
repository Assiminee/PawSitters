import {isPhoneNumber, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {User} from "../entities/User";

@ValidatorConstraint({ name: 'isValidRole', async: false })
export class IsValidPhone implements ValidatorConstraintInterface {
    validate(phone: string, args: ValidationArguments) {
        return (isPhoneNumber(phone, 'GH') || isPhoneNumber(phone, 'MA'))
    }

    defaultMessage(args: ValidationArguments) {
        return 'The phone number must be a valid Ghanaian or Moroccan number';
    }
}

@ValidatorConstraint({ name: 'isSitterFeeValid', async: false })
export class IsSitterFeeValidConstraint implements ValidatorConstraintInterface {
    validate(fee: any | null, args: ValidationArguments) {
        fee = Number(fee);
        const user: User = args.object as User;

        if (!user.role)
            return false;

        const hasSitterRole = user.role.role === "SITTER";

        return !(!hasSitterRole && fee !== null);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Fee can only be provided if the user has the role Sitter.';
    }
}

@ValidatorConstraint({name: 'isAdult', async: false})
export class IsAdult implements ValidatorConstraintInterface {
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

    defaultMessage(args: ValidationArguments) {
        return 'User must be an adult';
    }
}

