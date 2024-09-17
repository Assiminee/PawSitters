import {BaseController} from "./base.controller";
import {User} from "../../../orm/entities/User";
import {Role, Roles} from "../../../orm/entities/Role";
import {AppError, NotFoundError} from "../errors/Errors";
import {Address} from "../../../orm/entities/Address";
import {Pet} from "../../../orm/entities/Pet";
import {Certification} from "../../../orm/entities/Certification";
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

    public login = async (data: object) => {
        const user = await this.repository.findOne({
            // @ts-ignore
            where: {email: data.email},
            select: ['id', 'email', 'password', 'role'],
            relations: ['role']
        });

        if (!user)
            throw new NotFoundError("User not found", {error: "Invalid email"});

        const role = user.role.role.toLowerCase();
        // @ts-ignore
        const correctPassword = await user.validatePassword(data.password);

        if (!correctPassword)
            throw new AppError("Invalid password", 401,{error : "Invalid password"});

        const relations = this.getRelations({role: role});
        return this.getEntityById(user.id, relations);
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
        await newUser.encryptPassword();

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

        if ('password' in data)
            await user.encryptPassword();

        return await this.repository.save(user);
    }

    public deleteUser = async (id: string) => {
        const user = await this.repository.findOne({
            where: {id: id},
            relations: ['role', 'address']
        });

        if (!user || user.account_stat === "DELETED")
            throw new NotFoundError(
                "User not found",
                {failed: "delete", reason: `Invalid id ${id}`}
            );

        const role = user.role.role.toLowerCase();
        if (user.address)
            await Address.remove(user.address);

        this.removeImage(user.image_path);

        if (role === 'admin') {
            await this.repository.remove(user);
            return;
        }

        const relations = this.getRelations({role: role});
        const userToDelete = await this.getEntityById(id, relations);
        await this.del(userToDelete, role);
    }

    private del = async (user: User, role: string) => {
        if (role === 'sitter')
            await Certification.remove(user.certifications);

        if (this.canDelete(user)) {
            if (role === 'owner') {
                user.pets.forEach(pet => this.removeImage(pet.image_path));
                await Pet.remove(user.pets);
            }
            await this.repository.remove(user);
            return;
        }

        user.fname = "deleted";
        user.lname = "user";
        user.email = null;
        user.phone = null;
        user.password = null;
        user.bank_account_number = null;
        user.account_stat = "DELETED";
        user.image_path = null;
        user.fee = null;

        if (role === 'owner' && user.pets && user.pets.length > 0)
            user.pets = user.pets.map(pet => {
                pet.status = "DELETED";
                pet.image_path = null;
                return pet;
            });

        return this.repository.save(user);
    }

    private canDelete = (user: User) => {
        let key = "bookings";

        if (user.role.role === 'SITTER')
            key = "sittings";

        return (
            (!user.reviews_received || user.reviews_received.length === 0) &&
            (!user.reviews_given || user.reviews_given.length === 0) &&
            (!user[key] || user[key].length === 0)
        )
    }
}