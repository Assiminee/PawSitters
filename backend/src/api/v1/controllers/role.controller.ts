import {BaseController} from "./base.controller";
import {Role, Roles} from "../../../orm/entities/Role";

export class RoleController extends BaseController<Role> {
    constructor() {
        super(Role);
        this.entityColumns.required_columns = ['role'];
        this.entityColumns.unique_columns = ['role'];
    }

    createRole = async (data: object) => {
        this.checkData(data);
        if ('role' in data && typeof data.role === 'string')
            data.role = data.role.toUpperCase();
        await this.hasExistingData(data);

        const newRole = this.repository.create(data);
        await this.propertyValidation(newRole, 'Could not create role');

        return await this.repository.save(newRole);
    }
}