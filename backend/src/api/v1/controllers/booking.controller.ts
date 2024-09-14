import {BaseController} from "./base.controller";
import {Booking} from "../../../orm/entities/Booking";
import {User} from "../../../orm/entities/User";
import {AppError, ConflictError, ForbiddenRequest, InvalidDataError, NotFoundError} from "../errors/Errors";
import {In, LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import {Pet} from "../../../orm/entities/Pet";
import {UserController} from "./user.controller";
import {Payment} from "../../../orm/entities/Payment";
import {v4 as uuidV4} from 'uuid';

export class BookingController extends BaseController<Booking> {
    constructor() {
        super(Booking);
        this.entityColumns.required_columns = [
            "sitter", "start_date",
            "end_date", "pets"
        ];
        this.entityColumns.allowed_columns = this.entityColumns.required_columns;
    }

    public getBookingInfo = (booking : Booking) => {
        return {
            ...booking,
            owner: {
                ...booking.owner.getMinimalInfo(),
                address: booking.owner.address.removeCreatedUpdatedDates(),
            },
            sitter: {
                ...booking.sitter.getMinimalInfo(),
                address: booking.sitter.address.removeCreatedUpdatedDates(),
            },
            pets: booking.pets.map((pet: Pet) =>
                pet.removeCreatedUpdatedDates()
            ),
            reviews: booking.reviews,
            payment: booking.payment
        }
    }

    private userExists:
        (id: string, role: string, user: User | null) => asserts user is User =
        (id: string, role: string, user: User | null) => {
            if (!user || user.account_stat === "DELETED") {
                throw new NotFoundError(
                    `${role} not found`,
                    {not_found: `Invalid user id ${id}`}
                );
            }
        };

    private hasRequiredRole = (user: User, role: string, message: string) => {
        if (user.role.role !== role) {
            throw new ForbiddenRequest(
                message,
                {failed: "create", reason: "Missing required role"}
            );
        }
    }

    private isAdmin = (role: string) => {
        if (role === "ADMIN") {
            throw new NotFoundError(
                "Bookings not found",
                {not_found: `Invalid user role`}
            );
        }
    }

    private checkBookingCreationData = (data: object) => {
        this.checkData(data);
        this.checkDate(data, 'start_date');
        this.checkDate(data, 'end_date');

        if ('pets' in data && !this.isArrayOfValidStrings(data.pets))
            this.appendInvalidData({pets: "Must be an array of valid pet ids (strings)"});
        if ('sitter' in data && !(typeof data.sitter === 'string'))
            this.appendInvalidData({sitter: "Must be a valid sitter id (string)"});

        if (this.json.errors > 0)
            throw new InvalidDataError("Couldn't create booking", this.json);
    }

    public createBooking = async (id: string, data: object) => {
        const owner = await this.getOwner(id);
        this.checkBookingCreationData(data);

        const sitter = await User.findOne({
            // @ts-ignore
            where: {id: data.sitter},
            relations: ['role', 'sittings', 'address']
        });

        // @ts-ignore
        this.userExists(data.sitter, "Sitter", sitter);
        this.hasRequiredRole(sitter, "SITTER", "Only pet sitters can be booked for a service");
        // @ts-ignore
        data.sitter = sitter;
        if (sitter?.sittings) {
            const bookingConflict = await this.userBookingConflicts(
                // @ts-ignore
                sitter.id, 'sitter', ["ACTIVE"], data.start_date, data.end_date
            );
            if (bookingConflict.length > 0) {
                throw new ConflictError(
                    "Sitter already has bookings on the chosen dates",
                    {failed: "create", reason: "Booking dates conflict"}
                );
            }
        }

        // @ts-ignore
        data.pets = await this.checkPets(owner, data.pets, data.start_date, data.end_date);
        data = {...data, owner: owner};

        const newBooking = this.repository.create(data);
        await this.propertyValidation(newBooking, "Couldn't create booking");
        return await this.repository.save(newBooking);
    }

    private petConflicts = async (petId: string, statuses: string[], start: Date, end: Date) => {
        return await this.repository
            .createQueryBuilder("booking")
            .leftJoin("booking.pets", "pet")
            .where("pet.id = :petId", {petId})
            .andWhere("booking.status IN (:...statuses)", {statuses})
            .andWhere("booking.start_date <= :endDate", {endDate: end})
            .andWhere("booking.end_date >= :startDate", {startDate: start})
            .getMany();
    }


    public userBookingConflicts = async (id: string, user: string, statuses: string[], start: Date, end: Date) => {
        return this.repository.find({
            where: {
                [user]: {id: id},
                status: In(statuses),
                start_date: LessThanOrEqual(end),
                end_date: MoreThanOrEqual(start),
            },
        });
    }

    private getOwner = async (id: string) => {
        const owner = await User.findOne({
            where: {id: id},
            relations: ['pets', 'role', 'bookings', 'address']
        });

        if (!owner || owner.account_stat === "DELETED") {
            throw new NotFoundError(
                `Owner not found`,
                {not_found: `Invalid user id ${id}`}
            );
        }

        this.hasRequiredRole(owner, "OWNER", "Only pet owners can book services")

        if (!owner.pets || owner.pets.length === 0)
            throw new ConflictError(
                "Owner doesn't have the necessary data to book the service",
                {failed: "create", reason: "Owner has no pets"}
            );

        return owner;
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
            const booked = await this.petConflicts(pet_id, ["ACTIVE"], start, end)
            if (booked.length > 0) {
                bookedPets.push(pet_id);
                continue;
            }
            pets.push(pet);
        }

        if (invalidPetIds.length > 0) {
            throw new NotFoundError(
                "Invalid pet id(s)",
                {failed: "create", invalid_ids: invalidPetIds},
            );
        }

        if (bookedPets.length > 0) {
            throw new ConflictError(
                "User has already booked sitting services for pets",
                {failed: "create", booked_pets: bookedPets},
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
            id, [
                root, `${root}.payment`, `${root}.pets`,
                `${root}.owner`, `${root}.sitter`,
                `${root}.sitter.address`, `${root}.owner.address`,
                `${root}.reviews`
            ]
        );
        return userWithBookings[root];
    }

    public getBooking = async (user_id: string, booking_id: string) => {
        const user = await User.findOne({
            where: {id: user_id},
            select: ['id', 'role'],
            relations: ['role']
        });
        this.userExists(user_id, "Owner/sitter", user);

        const role = user.role.role;
        this.isAdmin(role);

        const where = {
            id: booking_id,
            [role.toLowerCase()]: {id: user_id}
        };

        const booking = await Booking.findOne(
            {
                where: where,
                relations: [
                    'payment', 'pets', 'owner', 'sitter', 'reviews',
                    'owner.address', 'sitter.address', 'reviews.reviewed',
                    'reviews.reviewer',
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

    private statusUpdateException = (condition: boolean, message: string) => {
        if (condition)
            throw new ForbiddenRequest(
                "Couldn't update booking",
                {failed: 'update', reason: message}
            );
    }

    private sitterBookingLogic = async (status: string, booking: Booking) => {
        const allowedStatuses = ['ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
        this.statusUpdateException(
            !allowedStatuses.includes(status),
            `A pet sitter can only set the status to ${allowedStatuses.join(', ')}`
        );

        if (status === 'COMPLETED') {
            this.statusUpdateException(
                booking.status !== 'ACTIVE',
                "Only active bookings can be marked 'COMPLETED'"
            );
            this.statusUpdateException(
                this.dateCompare(booking.end_date) > 0,
                "An active booking can only be marked 'COMPLETED' after the end date"
            );
        } else if (status === 'ACCEPTED' || status === 'REJECTED') {
            this.statusUpdateException(
                booking.status !== "PENDING",
                "Only pending bookings can be accepted/rejected"
            );
            if (status === "ACCEPTED") {
                const conflicts = await this.userBookingConflicts(booking.sitter.id, 'sitter', ["ACTIVE"], booking.start_date, booking.end_date);
                if (conflicts.length > 0) {
                    booking.status = "CANCELLED";
                    await this.repository.save(booking);
                    this.statusUpdateException(conflicts.length > 0, "The sitter already has bookings on the desired dates");
                }
                for (const pet of booking.pets) {
                    const bookings = await this.petConflicts(pet.id, ["ACTIVE"], booking.start_date, booking.end_date);
                    if (bookings.length > 0) {
                        booking.status = "CANCELLED"
                        await this.repository.save(booking);
                        this.statusUpdateException(bookings.length > 0, "Some pets in the booking have active bookings");
                    }
                }
            }
        } else if (status === "CANCELLED") {
            this.statusUpdateException(!["ACCEPTED", "ACTIVE"].includes(booking.status), "Only accepted or active bookings can be cancelled");
            if (booking.payment)
                await Payment.remove(booking.payment);
        }
    }

    public editBooking = async (user_id: string, booking_id: string, status: string) => {
        const booking = await this.getBooking(user_id, booking_id);

        this.statusUpdateException(
            ['REJECTED', 'CANCELLED', 'COMPLETED'].includes(booking.status),
            "A booking that's been 'rejected', 'cancelled', or 'completed' is not updatable"
        );

        const userRole = booking.owner.id === user_id ? "OWNER" : "SITTER";
        if (userRole === "SITTER") {
            await this.sitterBookingLogic(status, booking);
        } else {
            this.statusUpdateException(
                status !== "CANCELLED", "A pet owner can only set a booking's status to 'cancelled'."
            );
            if (booking.payment && this.dateCompare(booking.start_date) >= 1)
                await Payment.remove(booking.payment);
        }
        booking.status = status;
        return this.repository.save(booking);
    }

    private dateCompare = (date1: Date, date2: Date | null = null) => {
        if (!date2) {
            date2 = new Date();
            date2.setHours(0, 0, 0, 0);
        }
        const diffInMilliseconds = date1.getTime() - date2.getTime();

        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        return diffInMilliseconds / millisecondsPerDay;
    }

    public deleteBooking = async (user_id: string, booking_id: string) => {
        const booking = await this.getBooking(user_id, booking_id);
        if (["CANCELLED", "PENDING", "REJECTED"].includes(booking.status)) {
            if (booking.payment) {
                await Payment.remove(booking.payment);
                const paymentExists = await Payment.existsBy({id: booking.payment.id});
                this.deleteFailed(paymentExists, "payment");
            }
            await this.repository.remove(booking);
            const exists = await this.repository.existsBy({id: booking_id});
            this.deleteFailed(exists, "booking");
            return;
        }
        throw new ForbiddenRequest("Can't delete booking", {
            failed: "delete",
            reason: "Only bookings that are pending, cancelled, or rejected can be deleted"
        })
    }

    private deleteFailed = (exists: boolean, entity: string) => {
        if (exists)
            throw new AppError(
                `Failed to delete ${entity}`, 500,
                {failed: "delete", reason: "Unknown"}
            );
    }

    public addPayment = async (user_id: string, booking_id: string) => {
        const booking = await this.getBooking(user_id, booking_id);

        if (booking.sitter.id === user_id) {
            throw new ForbiddenRequest(
                "Could not create payment",
                {failed : 'create', reason: "Only owners can issue payments for services"}
            );
        }

        if (booking.status !== 'ACCEPTED') {
            const msg = booking.status === "ACTIVE" ? "is already" : "had been";
            throw new ForbiddenRequest(
                "Could not issue payment",
                {failed : 'create', reason: `This booking ${msg} '${booking.status}'`}
            );
        }

        if (booking.payment) {
            throw new ConflictError("Couldn't create payment", {
                failed: "create", reason: "A payment has already been issued for this booking"
            });
        }

        if (!booking.sitter.fee) {
            throw new ConflictError("Couldn't create payment", {
                failed: "create", reason: "A payment cannot be issued to a sitter that hasn't set a service fee"
            });
        }

        const amount = this.dateCompare(booking.end_date, booking.start_date) * booking.sitter.fee * booking.pets.length;
        const transaction_id = uuidV4();
        booking.payment = Payment.create({amount: amount, transaction_id: transaction_id});
        booking.status = "ACTIVE";
        await this.cancelAllConflictingBookings(booking);
        return this.repository.save(booking);
    }

    private cancelAllConflictingBookings = async (booking: Booking) => {
        const conflictingBookings = await this.userBookingConflicts(
            booking.sitter.id, 'sitter',
            ["PENDING", "ACCEPTED"],
            booking.start_date, booking.end_date
        );
        for (const pet of booking.pets) {
            const conflicts = await this.petConflicts(
                pet.id, ['PENDING', 'ACCEPTED'],
                booking.start_date, booking.end_date
            );
            conflictingBookings.push(...conflicts);
        }
        for (const conflict of conflictingBookings) {
            conflict.status = "CANCELLED";
            await this.repository.save(conflict);
        }
    }
}