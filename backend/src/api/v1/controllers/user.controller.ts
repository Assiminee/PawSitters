import {BaseController} from "./base.controller";
import {User} from "../../../orm/entities/User";
import {Role, Roles} from "../../../orm/entities/Role";
import {In} from "typeorm";

export class UserController extends BaseController<User> {
    constructor() {
        super(User);
        this.uniqueColumns = ['email', 'phone', 'bankAccountNumber'];
        this.allowed = ["email", "phone", "bank_account_number", "password", "fee"];
    }

    private getAdmins = async (params: object) => {
        const options = this.getOptions(params);
        const select = [
            "id", "fname", "lname",
            "createdAt", "updatedAt",
            "email", "phone", "password",
            "gender", "birthday", "account_stat"
        ];

        const users =  await this.repository.find({
            select: select,
            where: options,
            relations: ["roles", "address"]
        });

        return users.filter(user => user.roles.some(role => role.role === "ADMIN"));
    }

    private getOptions = (params: object) => {
        if (!('deleted' in params))
            return {};

        if (params.deleted === 'true')
            return {account_stat: "DELETED"}
        else
            return {account_stat: In(["ACTIVE", "PENDING"])};
    }

    private getRelations = (params: object) => {
        const relations = [
            "address", "photos",
            "reviews_received",
            "reviews_given", "roles"
        ];

        if ('role' in params) {
            if (params.role === 'sitter')
                relations.push(...["sittings", "certifications"]);
            else
                relations.push("pets");
        }

        return relations;
    }

    private filterUsers = (users : User[], params : object) => {
        if (!('role' in params))
            return users;

        if (params.role === 'sitter')
            return users.filter(user => user.roles.some(role => role.role === "SITTER"));
        else
            return users.filter(user => user.roles.some(role => role.role === "OWNER"));
    }

    public getUsers = async (params: object) => {
        if ('role' in params && params.role === 'admin')
            return this.getAdmins(params);

        const options = this.getOptions(params);
        const relations = this.getRelations(params);

        const users = await this.repository.find({
            where: options,
            relations: relations
        });

        return this.filterUsers(users, params);
    }

    private checkPhone = (data: object) => {
        if ('phone' in data && typeof data.phone === 'string')
            data.phone = data.phone.replace(/[^+\d]/g, '');
    }

    private checkAccountStatus = (data: object) => {
        if (!('account_stat' in data))
            return;

        this.appendInvalidData({account_stat: "Can't set account status manually"});
        delete data.account_stat;
    }

    private checkGender = (data: object) => {
        if ('gender' in data && typeof data.gender === 'string')
            data.gender = data.gender.toUpperCase();
    }

    private isArrayOfValidStrings = (arr: any) => {
        return Array.isArray(arr) && arr.length > 0 &&
            arr.every(item => (typeof item === 'string' && item.length > 0));
    }

    private validRolesArrayFormat = (data: object): string[] => {
        if (!('roles' in data)) {
            this.appendMissingData('roles');
            return [];
        }

        if (!this.isArrayOfValidStrings(data.roles))
            return [];

        const roles = data.roles as string[];
        delete data.roles;
        return roles;
    }

    private validRoles = (inputRoles: string[]) => {
        if (inputRoles.length === 0)
            return [];

        inputRoles = inputRoles.map(role => role.toUpperCase());
        const roles = Object.values(Roles);
        const validRoles = [];

        for (const role of roles) {
            if (inputRoles.includes(role))
                validRoles.push(role);
        }

        return validRoles;
    }

    private getRoles = async (inputRoles: string[]) => {
        let roles = [];
        const missingRoles: string[] = [];

        for (const inputRole of inputRoles) {
            const role = await Role.findOneBy({role: inputRole});
            if (!role)
                missingRoles.push(inputRole);
            else
                roles.push(role);
        }

        if (missingRoles.length === 0)
            return roles;

        return [];
    }

    public createUser = async (data: object) => {
        let inputRoles = this.validRolesArrayFormat(data);
        inputRoles = this.validRoles(inputRoles);

        this.checkData(data);
        this.checkPhone(data);
        await this.hasExistingData(data);
        this.checkGender(data);
        this.checkDate(data, "birthday");
        this.checkAccountStatus(data);

        const newUser = this.repository.create(data);
        const roles = await this.getRoles(inputRoles);
        newUser.roles = [];

        if (roles.length > 0)
            newUser.roles.push(...roles);

        await this.propertyValidation(newUser, 'Could not create user');

        return await this.repository.save(newUser);
    }

    private deleteRoles = async (user: User, inputRoles: Role[]) => {
        if (inputRoles.length === 0)
            return;

        const invalidRoles = [];

        for (const inputRole of inputRoles) {
            const roleIndex = user.roles.findIndex(role => role.role === inputRole.role);
            if (roleIndex !== -1) {
                if (inputRole.role === 'SITTER')
                    user.fee = null;
                user.roles.splice(roleIndex, 1);
            } else
                invalidRoles.push(inputRole);
        }

        if (invalidRoles.length > 0) {
            const message = "User doesn't have the following roles: " +
                invalidRoles.map(role => role.role).join(', ');
            this.appendInvalidData({
                delete_roles: message
            });
        }
    }

    private addRoles = async (user: User, inputRoles: Role[]) => {
        if (inputRoles.length === 0)
            return;

        user.roles.push(...inputRoles);
    }

    private checkEditRoles = async (data: object, key: string) => {
        if (!(key in data))
            return [];

        if (!this.isArrayOfValidStrings((data as any)[key])) {
            this.appendInvalidData({[key]: "Must be an array of strings"});
            delete (data as any)[key];
            return [];
        }

        let validRoles = this.validRoles((data as any)[key]);
        delete (data as any)[key];

        if (validRoles.length === 0) {
            this.appendInvalidData({[key]: `Invalid roles: ${(data as any)[key].join(", ")}`});
            return [];
        }

        return await this.getRoles(validRoles);
    }

    public editUser = async (id: string, data: object) => {
        const user = await this.getEntityById(id, ['roles']);
        const del = 'delete_roles' in data ? await this.checkEditRoles(data, 'delete_roles') : [];
        const add = 'add_roles' in data ? await this.checkEditRoles(data, 'add_roles') : [];

        this.hasInvalidColumns(data);
        this.forbiddenUpdate(data);
        this.checkPhone(data);
        await this.hasExistingData(data);
        await this.deleteRoles(user, del);
        await this.addRoles(user, add);
        this.updateProperties(user, data);
        await this.propertyValidation(user, "Could not update user");

        return await this.repository.save(user);
    }

    public deleteUser = async (id: string) => {
        const user = await this.getEntityById(id, ['roles']);
    }
}