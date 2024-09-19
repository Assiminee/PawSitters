import {BaseController} from "./base.controller";
import {Address} from "../../../orm/entities/Address";
import {User} from "../../../orm/entities/User";
import {ConflictError} from "../errors/Errors";

/**
 * Controller for managing Address entities, inheriting from BaseController.
 * Provides methods to create, update, and delete addresses, as well as retrieve address data.
 */
export class AddressController extends BaseController<Address> {
    /**
     * Initializes the AddressController with the Address entity and sets up column configurations.
     */
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

    /**
     * Extracts and formats address data for a given Address entity.
     *
     * @param {Address} address - The Address entity to extract data from.
     * @returns an object containing formatted address data.
     */
    public getAddressData = (address: Address) => {
        return {
            id: address.id,
            building_num: address.building_num,
            street: address.street,
            apartment_num: address.apartment_num,
            floor: address.floor,
            city: address.city,
            country: address.country,
            postal_code: address.postal_code,
            user: address.user.getMinimalInfo(),
        }
    }

    /**
     * Checks if the data object contains a user property and removes it if found.
     * This prevents manual setting of the user on an address.
     *
     * @param {object} data - The data object to check.
     */
    private checkUser = (data : object) => {
        if (!('user' in data))
            return;

        this.appendInvalidData({user: "Cannot manually set a user"});
        delete data.user;
    }

    /**
     * Creates a new address for the specified user.
     * Throws a ConflictError if the user already has an address.
     *
     * @param {User} user - The user for whom the address is to be created.
     * @param {object} data - The address data to create.
     * @returns the created address data.
     * @throws {ConflictError} - If the user already has an address.
     */
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

        return this.repository.save(this.getAddressData(newAddress));
    }

    /**
     * Updates the address of the specified user.
     * Throws a ConflictError if the user does not have an address.
     *
     * @param {User} user - The user whose address is to be updated.
     * @param {object} data - The new address data.
     * @returns the updated address data.
     * @throws {ConflictError} - If the user does not have an address.
     */
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

        return this.repository.save(this.getAddressData(user.address));
    }

    /**
     * Deletes the address of the specified user.
     * Throws a ConflictError if the user does not have an address.
     *
     * @param {User} user - The user whose address is to be deleted.
     * @returns resolves when the address is successfully deleted.
     * @throws {ConflictError} - If the user does not have an address.
     */
    public deleteAddress = async (user : User) => {
        if (!user.address) {
            const message = "Can't delete address (user doesn't have an address)"
            throw new ConflictError(message, {failed: 'delete', reason: message});
        }

        return this.repository.remove(user.address);
    }
}