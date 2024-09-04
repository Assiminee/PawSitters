import {BaseController} from "./base.controller";
import {Address} from "../../../orm/entities/Address";
import {User} from "../../../orm/entities/User";
import {ConflictError} from "../errors/Errors";

export class AddressController extends BaseController<Address> {
    constructor() {
        super(Address);
        this.entityColumns.required_columns = [
            "street", "city", "country", "postal_code"
        ];
        this.entityColumns.allowed_columns = [
            "street", "city", "country", "postal_code",
            "building_num", "apartment_num", "floor"
        ];
        this.entityColumns.updatable_columns = this.entityColumns.allowed_columns;
    }

    private checkUser = (data : object) => {
        if (!('user' in data))
            return;

        this.appendInvalidData({user: "Cannot manually set a user"});
        delete data.user;
    }

    public createAddress = async (user : User, data : object) => {
        if (user.address)
            throw new ConflictError(
                `User already has an address`,
                {failed : 'create'},
            )
        this.checkUser(data);
        this.checkData(data);

        if ('country' in data && typeof data.country === 'string')
            data.country = data.country.toUpperCase();

        const newAddress = this.repository.create(data);
        newAddress.user = user;
        await this.propertyValidation(newAddress, 'Could not create address');

        return await this.repository.save(newAddress);
    }

    public updateAddress = async (user : User, data : object) => {
        if (!user.address)
            throw new ConflictError(
                `User doesn't have an address`,
                {failed : 'update'},
            )

        this.checkUser(data);
        this.checkData(data);

        if ('country' in data && typeof data.country === 'string')
            data.country = data.country.toUpperCase();

        this.updateProperties(user.address, data);
        await this.propertyValidation(user.address, 'Could not update address');

        return await this.repository.save(user.address);
    }

    public deleteAddress = async (user : User) => {
        if (!user.address) {
            const message = "Can't delete address (user doesn't have an address)"
            throw new ConflictError(message, {failed: 'delete', reason: message});
        }

        return await this.repository.remove(user.address);
    }
}