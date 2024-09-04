import {BaseController} from "./base.controller";
import {Booking} from "../../../orm/entities/Booking";

export class BookingController extends BaseController<Booking>{
    constructor() {
        super(Booking);

    }

}