import {BaseController} from "./base.controller";
import {User} from "../../../orm/entities/User";
import {Role, Roles} from "../../../orm/entities/Role";
import {AppError, NotFoundError} from "../errors/Errors";
import {Address} from "../../../orm/entities/Address";
import {Pet} from "../../../orm/entities/Pet";
import {Certification} from "../../../orm/entities/Certification";
import {BookingController} from "./booking.controller";

/**
 * UserController: class that handles operations on user
 *                 entities. Handles fetching, creating,
 *                 updating, and deleting users.
 */
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

    /**
     * getAdmins: fetches users whose role is 'ADMIN'
     * @param params : object - contains the query parameters
     * of the URI that gets the list of user entities
     *
     * return: Promise<User[]>
     */
    private getAdmins = async (params: object) => {
        const options = this.getOptions(params);
        const relations = this.getRelations(params);
        const select = [
            "id", "fname", "lname",
            "createdAt", "updatedAt",
            "email", "phone", "password",
            "gender", "birthday", "account_stat"
        ];

        return this.repository.find({
            select: select,
            where: options,
            relations: relations
        });
    }

    /**
     * getOptions: constructs an object that will be passed as the value of
     * 'where' for a Repository.find()
     *
     * @param params : object - contains the query parameters
     * of the URI that gets the list of user entities
     *
     * return: an object containing the constraints that will be taken
     * into account when searching for user entities
     */
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

    /**
     * getRelations: gets the entity relations that are relevant to
     * a user entity based on its role.
     *
     * @param params : object - contains the query parameters
     * of the URI that gets the list of user entities
     *
     * return: an array of strings where each string represents a user entity
     * relation.
     */
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

    /**
     * @param address : Address - an address entity or a null value
     *
     * @param params : object - contains the query parameters
     * of the URI that gets a list of sitters. This object is
     * expected to be in the following format:
     * {
     *     start_date: YYYY-MM-DD,
     *     end_date: YYYY-MM-DD,
     *     city: "a city",
     *     morocco: "MOROCCO or GHANA",
     * }
     *
     * isValidLocation: checks if an address has the same city and country
     * as the values passed in the request query.
     *
     * returns: true if the address matches the request query parameters,
     * otherwise false.
     */
    private isValidLocation = (address : Address | null, params : Record<string, any>) => {
        return (
            address && address.city === params.city.toLowerCase() &&
            address.country === params.country.toUpperCase()
        )
    }

    /**
     * getAvailableSitters: gets a list of user entities whose role
     * is 'SITTER', whose address matches the city and country in
     * the URI request parameters, and who has no bookings in during
     * the date interval specified in the request parameters.
     *
     * @param params : object - contains the query parameters
     * of the URI that gets a list of sitters. This object is
     * expected to be in the following format:
     * {
     *     start_date: YYYY-MM-DD,
     *     end_date: YYYY-MM-DD,
     *     city: "a city",
     *     morocco: "MOROCCO or GHANA",
     * }
     * params is guaranteed to be in this format since it gets checked
     * before ever reaching this method
     *
     * return: Promise<User[]> - a list of sitters that match the request
     * query parameters.
     */
    public getAvailableSitters = async (params : Record<string, any>) => {
        this.checkDate(params, 'start_date');
        this.checkDate(params, 'end_date');
        const bookingController = new BookingController();
        const availableSitters : User[] = [];

        const users = await this.getUsers({deleted : 'false', role: 'sitter'});
        for (const user of users) {
            if (!this.isValidLocation(user.address, params))
                continue;

            const bookingConflict = await bookingController.userBookingConflicts(
                user.id, 'sitter', ["ACTIVE"], params.start_date, params.end_date
            );
            if (bookingConflict.length === 0)
                availableSitters.push(user);
        }
        return availableSitters;
    }

    /**
     * getUsers: gets a list of users. These users are either filtered
     * by role, account status (whether their account is active or not),
     * or both.
     *
     * @param params : object - the request query parameters in the URI.
     * It can contain role=sitter|owner|admin and/or deleted=true
     *
     * return: the list of users that match the constraints in the
     * query parameters
     */
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

    /**
     * getUser: gets a single user based o user id. If the user isn't
     * found, an error is thrown
     *
     * @param id : string - the id to search for
     *
     * return: User - a user whose id matches the id passed as a parameter
     */
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

    /**
     * login: handles user login by checking if the email passed as a
     * parameter exists and if the password is correct
     *
     * @param data : object - must be in the format {
     *     email: "email@example.com",
     *     password: "pwd"
     * }
     *
     * return: Promise<User> - returns the user whose email and password
     * matches the data passed.
     */
    public login = async (data: Record<string, any>) => {
        const user = await this.repository.findOne({
            where: {email: data.email},
            select: ['id', 'email', 'password', 'role'],
            relations: ['role']
        });

        if (!user)
            throw new NotFoundError("User not found", {error: "Invalid email"});

        const role = user.role.role.toLowerCase();
        const correctPassword = await user.validatePassword(data.password);

        if (!correctPassword)
            throw new AppError("Invalid password", 401,{error : "Invalid password"});

        const relations = this.getRelations({role: role});
        return this.getEntityById(user.id, relations);
    }

    /**
     * checkPhone: cleans up a string containing a phone number in
     * order to make sure that all phone numbers are normalized and
     * follow a specific format +XXXXXXXXXXX
     *
     * @param data : object - the body of a request
     *
     * return: void
     */
    private checkPhone = (data: object) => {
        if ('phone' in data && typeof data.phone === 'string')
            data.phone = data.phone.replace(/[^+\d]/g, '');
    }

    /**
     * checkAccountStatus: makes sure that account_stat
     * is not set manually by the user. Deletes it if it
     * exists and keeps track of its presence so that it
     * is returned to the user for them to know that it
     * is forbidden
     *
     * @param data : object - the body of a request
     *
     * return: void
     */
    private checkAccountStatus = (data: object) => {
        if (!('account_stat' in data))
            return;

        this.appendInvalidData({account_stat: "Can't set account status manually"});
        delete data.account_stat;
    }

    /**
     * checkGender: normalizes the user input for the field gender
     * making it possible to use both uppercase and lowercase
     *
     * @param data : object - the body of a request
     *
     * return: void
     */
    private checkGender = (data: object) => {
        if ('gender' in data && typeof data.gender === 'string')
            data.gender = data.gender.toUpperCase();
    }

    /**
     * setRole: fetches the role that matches the one requested
     * in the request body in order to set it for a user during
     * creation
     *
     * @param data : object - the body of a request
     *
     * return: void
     */
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

    /**
     * creatUser: creates a user instance based on the request body
     *
     * @param data : object - the body of a request
     *
     * return: Promise<User> newly created user
     */
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

    /**
     * editUser: Edits user information
     *
     * @param id : string - the id of the user to edit
     * @param data : object - the request body
     *
     * return: Promise<User> the updated user
     */
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

    /**
     * deleteUser: deletes a user instance whose id matches the
     * one passed as a parameter
     *
     * @param id : string - the id of the user to delete
     *
     * return: void
     */
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

    /**
     * del: handles user deletion in the case where the user's profile
     * can or can't be deleted. A user who's had previous bookings cannot
     * be fully deleted, instead their information is set to null, the
     * account status is set to 'DELETED', but their id is preserved.
     *
     * @param user : User - the user to delete
     * @param role : string - the user's role. Used to check which data
     * must be deleted.
     *
     * return: void | User
     */
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

    /**
     * canDelete: checks if a user can be deleted
     *
     * @param user : User - user to check
     *
     * return: boolean - true if the user has no bookings/sittings,
     * have given nor received any reviews
     */
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