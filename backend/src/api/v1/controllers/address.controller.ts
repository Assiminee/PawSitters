import {BaseController} from "./base.controller";
import {Address} from "../../../orm/entities/Address";

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

}