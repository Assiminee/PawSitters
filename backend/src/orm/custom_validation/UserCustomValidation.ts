import {isPhoneNumber, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {User} from "../entities/User";
import {Role} from "../entities/Role";

@ValidatorConstraint({ name: 'isValidRole', async: false })
export class IsValidPhone implements ValidatorConstraintInterface {
    validate(phone: string, args: ValidationArguments) {
        if (isPhoneNumber(phone, 'GH') || isPhoneNumber(phone, 'MA')) {
            phone = phone.replace(/[^+\d]/g, '');
            return true;
        }
        return false
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
        const hasSitterRole = user.roles.some(role => role.role === 'SITTER');

        return !(!hasSitterRole && fee !== null);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Fee can only be provided if the user has the role Sitter.';
    }
}

@ValidatorConstraint({name: 'hasNoDuplicateRoles', async: false })
export class HasNoDuplicateRoles implements ValidatorConstraintInterface {
    validate(roles : Role[], args: ValidationArguments) {
        const rolesSet = new Set(roles.map(role => role.role))

        return rolesSet.size === roles.length;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Detected duplicate roles.';
    }
}

@ValidatorConstraint({name: 'isNotEmptyRolesArray', async: false })
export class IsNotEmptyRolesArray implements ValidatorConstraintInterface {
    validate(roles : Role[], args: ValidationArguments) {
        return roles.length > 0;
    }

    defaultMessage(args: ValidationArguments) {
        return "Missing roles: either an invalid role was passed " +
            "or roles weren't in the format ['role1', 'role2'...]. " +
            "Options: Admin, Sitter, Owner";
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

