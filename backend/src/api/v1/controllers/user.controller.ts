import {BaseController} from "./base.controller";
import {User} from "../../../orm/entities/User";
import {NotFoundError} from "../errors/Errors";
import {Address} from "../../../orm/entities/Address";
import {BookingController} from "./booking.controller";

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

    public getRelations = (params: object) => {
        if ('role' in params && params.role === 'admin')
            return ["role", "address"];

        const relations = [
            "address", "reviews_received",
            "reviews_given", "role"
        ];

        if ('role' in params) {
            params.role === 'sitter' ?
                relations.push(...["sittings", "certifications"]) :
                relations.push(...["pets", "bookings"]);
        }

        return relations;
    }

    private isValidLocation = (address : Address | null, params : object) => {
        return (
            // @ts-ignore
            address && address.city === params.city.toLowerCase() &&
            // @ts-ignore
            address.country === params.country.toUpperCase()
        )
    }

    public getAvailableSitters = async (params : object) => {
        this.checkDate(params, 'start_date');
        this.checkDate(params, 'end_date');
        const bookingController = new BookingController();
        const availableSitters : User[] = [];

        const users = await this.getUsers({deleted : 'false', role: 'sitter'});
        for (const user of users) {
            if (!this.isValidLocation(user.address, params))
                continue;

            const bookingConflict = await bookingController.userBookingConflicts(
                // @ts-ignore
                user.id, 'sitter', ["ACTIVE"], params.start_date, params.end_date
            );
            if (bookingConflict.length === 0)
                availableSitters.push(user);
        }
        return availableSitters;
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

        return users.map(user => {
            if (user.role.role === 'ADMIN') {
                for (const relation of relations) {
                    if (['role', 'address'].includes(relation))
                        continue;
                    delete user[relation];
                }
            }

            if (user.role.role !== 'ADMIN') {
                const totalRating = user.reviews_received.reduce((acc, review) => acc + review.rating, 0);
                user.rating = totalRating ? totalRating / user.reviews_received.length : 0;
            }

            if (user.role.role !== 'SITTER')
                delete user.fee;

            return user;
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

        const foundUser = await this.repository.findOneOrFail({
            where: {id: id},
            relations: relations
        });

        if (foundUser.role.role !== 'ADMIN') {
            const totalRating = foundUser.reviews_received.reduce((acc, review) => acc + review.rating, 0);
            foundUser.rating = totalRating ? totalRating / foundUser.reviews_received.length : 0;
        }
        return foundUser;
    }
}