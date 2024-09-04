import {BaseController} from "./base.controller";
import {User} from "../../../orm/entities/User";
import {Role, Roles} from "../../../orm/entities/Role";
import {NotFoundError} from "../errors/Errors";

export class UserController extends BaseController<User> {
    constructor() {
        super(User);
        this.entityColumns.required_columns = [
            "fname", "lname", "email",
            "password", "gender", "birthday",
            "role"
        ];
        this.entityColumns.unique_columns = [
            "email", "phone", "bank_account_number"
        ];
        this.entityColumns.updatable_columns = [
            "email", "phone", "bank_account_number", "password", "fee"
        ]
        this.entityColumns.allowed_columns = [
            "fname", "lname", "email",
            "password", "gender", "birthday",
            "role", "phone", "bank_account_number",
            "fee"
        ]
    }

    private getAdmins = async (params: object) => {
        const options = this.getOptions(params);
        const relations = this.getRelations(params);
        const select = [
            "id", "fname", "lname",
            "createdAt", "updatedAt",
            "email", "phone", "password",
            "gender", "birthday", "account_stat"
        ];

        return await this.repository.find({
            select: select,
            where: options,
            relations: relations
        });
    }

    private getOptions = (params: object) => {
        let options = {};
        if (!('deleted' in params))
            options = {};
        else
            options = {account_stat: params.deleted === 'true' ? "DELETED" : "ACTIVE"};

        if (!('role' in params))
            return options;

        return {...options, role: {role: (params.role as string).toUpperCase()}};
    }

    private getRelations = (params: object) => {
        if ('role' in params && params.role === 'admin')
            return ["role", "address"];

        const relations = [
            "address", "photos",
            "reviews_received",
            "reviews_given", "role"
        ];

        if ('role' in params) {
            params.role === 'sitter' ?
                relations.push(...["sittings", "certifications"]) :
                relations.push(...["pets", "bookings"]);
        }

        return relations;
    }

    public getUsers = async (params: object) => {
        if ('role' in params && params.role === 'admin')
            return this.getAdmins(params);

        const options = this.getOptions(params);
        const relations = this.getRelations(params);

        return await this.repository.find({
            where: options,
            relations: relations
        });
    }

    public getUser = async (id: string) => {
        const user = await this.repository.findOne({
            where: {id: id},
            select: ['role', 'id'],
            relations: ['role']
        });

        if (!user)
            throw new NotFoundError(`User not found`, {not_found: `Invalid ID ${id}`});

        const relations = this.getRelations({role: user.role.role.toLowerCase()});

        return await this.repository.findOne({
            where: {id: id},
            relations: relations
        })
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

    private setRole = async (data: object) => {
        if (!('role' in data))
            return;

        if (typeof data.role !== 'string' ||
            !Object.values(Roles).includes(data.role.toUpperCase() as Roles)
        ) {
            delete data.role;
            return;
        }

        data.role = await Role.findOneBy({role: data.role.toUpperCase()});
    }

    public createUser = async (data: object) => {
        await this.setRole(data);
        this.checkData(data);
        this.checkPhone(data);
        await this.hasExistingData(data);
        this.checkGender(data);
        this.checkDate(data, "birthday");
        this.checkAccountStatus(data);

        const newUser = this.repository.create(data);

        await this.propertyValidation(newUser, 'Could not create user');

        return await this.repository.save(newUser);
    }

    public editUser = async (id: string, data: object) => {
        const user = await this.getEntityById(id, ['role']);

        this.hasInvalidColumns(data);
        this.forbiddenUpdate(data);
        this.checkPhone(data);
        await this.hasExistingData(data, id);
        this.updateProperties(user, data);
        await this.propertyValidation(user, "Could not update user");

        return await this.repository.save(user);
    }

    public deleteUser = async (id: string) => {
        const user = await this.repository.findOne({
            where : {id: id},
            select : ['id', 'role'],
            relations: ['role']
        });

        if (!user)
            throw new NotFoundError(
                "User not found",
                {failed : "delete", reason: `Invalid id ${id}`}
            );

        
    }
}