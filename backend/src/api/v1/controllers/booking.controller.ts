import {BaseController} from "./base.controller";
import {Booking} from "../../../orm/entities/Booking";
import {User} from "../../../orm/entities/User";
import {ConflictError, ForbiddenRequest, InvalidDataError, NotFoundError} from "../errors/Errors";
import {LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import {Pet} from "../../../orm/entities/Pet";
import {UserController} from "./user.controller";

export class BookingController extends BaseController<Booking> {
    constructor() {
        super(Booking);
        this.entityColumns.required_columns = [
            "sitter", "start_date",
            "end_date", "pets"
        ];
        this.entityColumns.allowed_columns = this.entityColumns.required_columns;
    }

    private userExists:
        (id: string, role: string, user: User | null) => asserts user is User =
        (id: string, role: string, user: User | null) => {
        if (!user || user.account_stat === "DELETED") {
            throw new NotFoundError(
                `${role} not found`,
                { not_found: `Invalid user id ${id}` }
            );
        }
    };

    private hasRequiredRole = (user : User, role : string, message : string) => {
        if (user.role.role !== role) {
            throw new ForbiddenRequest(
                message,
                {failed: "create", reason: "Missing required role"}
            );
        }
    }

    private isAdmin = (role : string) => {
        if (role === "ADMIN") {
            throw new NotFoundError(
                "Bookings not found",
                {not_found: `Invalid user role`}
            );
        }
    }

    public createBooking = async (id: string, data: object) => {
        const owner = await User.findOne({
            where: {id: id},
            relations: ['pets', 'role', 'bookings', 'address']
        });

        this.checkOwner(id, owner);
        this.checkData(data);

        // @ts-ignore
        data.pets = await this.checkPets(owner, data.pets, data.start_date, data.end_date);
        data = {...data, owner: owner};

        const sitter = await User.findOne({
            // @ts-ignore
            where: {id: data.sitter},
            relations: ['role', 'sittings', 'address']
        });

        // @ts-ignore
        this.checkSitter(data.sitter, sitter);
        // @ts-ignore
        data.sitter = sitter;

        this.checkDate(data, 'start_date');
        this.checkDate(data, 'end_date');

        if (sitter?.sittings) {
            const bookingConflict = await this.isSitterBookingConflict(
                // @ts-ignore
                sitter.id, data.start_date, data.end_date
            );
            if (bookingConflict) {
                throw new ConflictError(
                    "Sitter already has bookings on the chosen dates",
                    {failed: "create", reason: "Booking dates conflict"}
                );
            }
        }

        const newBooking = this.repository.create(data);
        await this.propertyValidation(newBooking, "Couldn't create booking");
        return await this.repository.save(newBooking);
    }

    private isPetBookingConflict = async (petId: string, start: Date, end: Date) => {
        const conflicts = await this.repository
            .createQueryBuilder("booking")
            .leftJoin("booking.pets", "pet")
            .where("pet.id = :petId", {petId})
            .andWhere("booking.status = :status", {status: "ACTIVE"})
            .andWhere("booking.start_date <= :endDate", {endDate: end})
            .andWhere("booking.end_date >= :startDate", {startDate: start})
            .getMany();

        return conflicts.length > 0;
    }


    public isSitterBookingConflict = async (id: string, start: Date, end: Date) => {
        const conflicts = await this.repository.find({
            where: {
                sitter: {id: id},
                status: "ACTIVE",
                start_date: LessThanOrEqual(end),
                end_date: MoreThanOrEqual(start),
            },
        });
        return conflicts.length > 0;
    }

    private checkSitter = (id: string, sitter: User | null) => {
        this.userExists(id, "Sitter", sitter);
        this.hasRequiredRole(
            sitter, "SITTER",
            "A user can only book the services of a user with the role 'SITTER'"
            );
    }

    private checkOwner = (id: string, owner: User | null) => {
        this.userExists(id, "Owner", owner);
        this.hasRequiredRole(
            owner, "OWNER",
            "Only users with the role 'OWNER' can request a service"
            );

        if (!owner.pets || owner.pets.length === 0)
            throw new ConflictError(
                "Owner doesn't have the necessary data to book the service",
                {failed: "create", reason: "Owner has no pets"}
            );
    }

    private checkPets = async (owner: User, pet_ids: string[], start: Date, end: Date) => {
        const invalidPetIds = [];
        const pets: Pet[] = [];
        const bookedPets = [];

        for (const pet_id of pet_ids) {
            const pet = owner.pets.find(pet => pet.id === pet_id);
            if (!pet) {
                invalidPetIds.push(pet_id);
                continue;
            }
            const booked = await this.isPetBookingConflict(pet_id, start, end)
            if (booked) {
                bookedPets.push(pet_id);
                continue;
            }
            pets.push(pet);
        }

        if (invalidPetIds.length > 0) {
            throw new NotFoundError(
                "Invalid pet id(s)",
                {failed: "create", reason: invalidPetIds},
            );
        }

        if (bookedPets.length > 0) {
            throw new ConflictError(
                "User has already booked sitting services for pets",
                {failed: "create", reason: bookedPets},
            );
        }

        return pets;
    }

    public getBookings = async (id: string, userController: UserController) => {
        const user = await User.findOne({
            where: {id: id},
            select: ['id', 'role'],
            relations: ['role']
        });
        this.userExists(id, "Owner/sitter", user);
        const role = user.role.role;
        this.isAdmin(role);

        const root = role === "SITTER" ? "sittings" : "bookings";

        const userWithBookings = await userController.getEntityById(
            id, [root, `${root}.payment`, `${root}.pets`, `${root}.owner`, `${root}.sitter`]
        );
        return userWithBookings[root];
    }

    public getBooking = async (user_id : string, booking_id : string) => {
        const user = await User.findOne({
            where : {id : user_id},
            select : ['id', 'role'],
            relations: ['role']
        });
        this.userExists(user_id, "Owner/sitter", user);

        const role = user.role.role;
        this.isAdmin(role);

        const where = {
            id: booking_id,
            [role.toLowerCase()] : {id : user_id}
        };

        const booking = await Booking.findOne(
            {
                where : where,
                relations: [
                    'payment', 'pets', 'owner', 'sitter'
                ]
            });

        if (!booking) {
            throw new NotFoundError(
                "Booking not found",
                {not_found: `Invalid id ${booking_id}`}
            );
        }

        return booking;
    }

    public editBooking = async (
        user_id : string, booking_id : string,
        data : object, userController : UserController
    ) => {
        const bookings = await this.getBookings(user_id, userController);
        const booking = bookings.find(booking => booking.id === booking_id);

        if (!booking) {
            throw new NotFoundError(
                "Bookings not found",
                {not_found: `Invalid booking id ${booking_id}`}
            );
        }

        if (!this.validStatus(data))
            throw new InvalidDataError(
                "A booking's status can either be set to cancelled or completed",
                {}
                );

        if ('cancelled' in data)
            booking.status = "CANCELLED";
        else
            booking.status = "COMPLETED";

        return await this.repository.save(booking);
    }

    private validStatus = (data : object) => {
        return (
            Object.keys(data).length === 1 && 'status' in data &&
            typeof data.status === 'string' &&
            ['CANCELLED', 'COMPLETED'].includes(data.status.toUpperCase())
        )
    }
}