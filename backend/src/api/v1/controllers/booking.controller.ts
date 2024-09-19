import {BaseController} from "./base.controller";
import {Booking} from "../../../orm/entities/Booking";
import {User} from "../../../orm/entities/User";
import {AppError, ConflictError, ForbiddenRequest, InvalidDataError, NotFoundError} from "../errors/Errors";
import {In, LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import {Pet} from "../../../orm/entities/Pet";
import {UserController} from "./user.controller";
import {Payment} from "../../../orm/entities/Payment";
import {v4 as uuidV4} from 'uuid';

/**
 * BookingController handles the CRUD operations for bookings between pets owners and sitters.
 * Extends the BaseController class to inherit common CRUD functionalities.
 */
export class BookingController extends BaseController<Booking> {
    constructor() {
        super(Booking);

        // Required columns for creating a booking
        this.entityColumns.required_columns = [
            "sitter", "start_date",
            "end_date", "pets"
        ];

        // Allowed columns for booking data
        this.entityColumns.allowed_columns = this.entityColumns.required_columns;
    }

    /**
     * Returns detailed information about a specific booking, including related entities
     * such as owner, sitter, pets, reviews, and payment.
     *
     * @param booking The Booking entity instance
     * @returns Object containing sanitized and detailed booking info
     */
    public getBookingInfo = (booking : Booking) => {
        return {
            ...booking,
            owner: {
                ...booking.owner.getMinimalInfo(),
                address: booking.owner.address ? booking.owner.address.removeCreatedUpdatedDates() : null,
            },
            sitter: {
                ...booking.sitter.getMinimalInfo(),
                address: booking.sitter.address ? booking.sitter.address.removeCreatedUpdatedDates() : null,
            },
            pets: booking.pets.map((pet: Pet) =>
                pet.removeCreatedUpdatedDates()
            ),
            reviews: booking.reviews,
            payment: booking.payment
        }
    }


    /**
     * Asserts that a user exists in the system and their account is not deleted.
     * @throws a NotFoundError if the user is invalid or deleted.
     *
     * @param id The ID of the user
     * @param role The expected role of the user (e.g., 'Sitter', 'Owner')
     * @param user The User entity instance or null if not found
     */
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

    /**
     * Ensures that the user has the required role to perform an action.
     * @throws a ForbiddenRequest if the role is insufficient.
     *
     * @param user The User entity
     * @param role The required role for the action
     * @param message Custom error message to provide context
     */
    private hasRequiredRole = (user: User, role: string, message: string) => {
        if (user.role.role !== role) {
            throw new ForbiddenRequest(
                message,
                {failed: "create", reason: "Missing required role"}
            );
        }
    }

    /**
     * Throws a NotFoundError if the user's role is 'ADMIN', as admins
     * don't have bookings to retrieve or modify.
     *
     * @param role The role of the user
     */
    private isAdmin = (role: string) => {
        if (role === "ADMIN") {
            throw new NotFoundError(
                "Bookings not found",
                {not_found: `Invalid user role`}
            );
        }
    }

    /**
     * Validates data provided for creating a booking, checking that necessary fields
     * like 'sitter', 'start_date', 'end_date', and 'pets' are present and valid.
     * @throws an InvalidDataError if any of the checks fail.
     *
     * @param data The data object containing booking information
     */
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

    /**
     * Creates a booking by validating the owner's data, checking for scheduling
     * conflicts with the sitter and pets, and then saving the booking to the database.
     *
     * @param id The ID of the pet owner making the booking
     * @param data The booking data
     * @returns The newly created Booking entity
     */
    public createBooking = async (id: string, data: Record<string, any>) => {
        const owner = await this.getOwner(id); // Retrieve owner details
        this.checkBookingCreationData(data); // Validate the incoming booking data

        const sitter = await User.findOne({
            where: {id: data.sitter},
            relations: ['role', 'sittings', 'address']
        });

        // Ensure sitter exists and is not deleted
        this.userExists(data.sitter, "Sitter", sitter);
        // Ensure the sitter role is correct
        this.hasRequiredRole(sitter, "SITTER", "Only pet sitters can be booked for a service");

        data.sitter = sitter;
        if (sitter?.sittings) {
            // Check for any booking conflicts with the sitter's existing bookings
            const bookingConflict = await this.userBookingConflicts(
                sitter.id, 'sitter', ["ACTIVE"], data.start_date, data.end_date
            );
            if (bookingConflict.length > 0) {
                throw new ConflictError(
                    "Sitter already has bookings on the chosen dates",
                    {failed: "create", reason: "Booking dates conflict"}
                );
            }
        }

        // Validate the selected pets for the booking
        data.pets = await this.checkPets(owner, data.pets, data.start_date, data.end_date);
        // Include owner information in the booking data
        data = {...data, owner: owner};

        // Create the booking entity and validate its properties
        const newBooking = this.repository.create(data);
        await this.propertyValidation(newBooking, "Couldn't create booking");
        // Save the new booking in the database
        return await this.repository.save(newBooking);
    }

    /**
     * Retrieves potential booking conflicts for a specific pet within the given date range
     * and booking statuses.
     *
     * @param petId The ID of the pet
     * @param statuses Array of booking statuses to check for (e.g., 'ACTIVE')
     * @param start Start date for the booking
     * @param end End date for the booking
     * @returns An array of conflicting bookings
     */
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


    /**
     * Finds any booking conflicts for a user within a specified date range and statuses.
     *
     * @param {string} id - The ID of the user (pet owner or sitter).
     * @param {string} user - The type of user ('owner' or 'sitter').
     * @param {string[]} statuses - The statuses to check for conflicts (e.g., 'ACTIVE').
     * @param {Date} start - The start date of the booking.
     * @param {Date} end - The end date of the booking.
     * @returns a list of conflicting bookings if found.
     */
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

    /**
     * Fetches the owner by ID, ensures they exist, and checks they are allowed to book services.
     *
     * @param {string} id - The ID of the owner to retrieve.
     * @throws {NotFoundError} - If the owner is not found or is marked as deleted.
     * @throws {ConflictError} - If the owner has no pets.
     * @returns the owner with pets, bookings, and related data.
     */
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

    /**
     * Checks if the provided pet IDs are valid and available for
     * booking during the given date range.
     *
     * @param {User} owner - The owner object that contains pet details.
     * @param {string[]} pet_ids - Array of pet IDs to check.
     * @param {Date} start - Start date of the booking.
     * @param {Date} end - End date of the booking.
     * @throws {NotFoundError} - If one or more pet IDs are invalid.
     * @throws {ConflictError} - If one or more pets are already booked.
     * @returns an array of valid pets for booking.
     */
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

    /**
     * Retrieves all bookings for a user based on their role (owner/sitter).
     *
     * @param {string} id - The user ID.
     * @param {UserController} userController - Controller to help fetch detailed user info.
     * @throws {NotFoundError} - If the user is not found.
     * @returns the list of bookings for the user.
     */
    public getBookings = async (id: string, userController: UserController) => {
        const user = await User.findOne({
            where: {id: id},
            select: ['id', 'role'],
            relations: ['role']
        });
        this.userExists(id, "Owner/sitter", user);
        const role = user.role.role;
        this.isAdmin(role);

        // Determine which field to use for bookings
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

    /**
     * Fetches a booking by user ID and booking ID, ensuring the user has the necessary role.
     *
     * @param {string} user_id - The ID of the user (owner or sitter).
     * @param {string} booking_id - The ID of the booking to retrieve.
     * @throws {NotFoundError} - If the user or booking is not found.
     * @returns the booking details along with related entities.
     */
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

    /**
     * Checks for a condition and throws a ForbiddenRequest error if true.
     *
     * @param {boolean} condition - The condition to check.
     * @param {string} message - The message to include in the error.
     * @throws {ForbiddenRequest} - If the condition is true.
     */
    private statusUpdateException = (condition: boolean, message: string) => {
        if (condition)
            throw new ForbiddenRequest(
                "Couldn't update booking",
                {failed: 'update', reason: message}
            );
    }

    /**
     * Handles booking status updates for sitters, including validation and conflict checks.
     *
     * @param {string} status - The new status to update the booking to.
     * @param {Booking} booking - The booking object to update.
     * @throws {ForbiddenRequest} - If the status change is invalid.
     */
    private sitterBookingLogic = async (status: string, booking: Booking) => {
        const allowedStatuses = ['ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

        // Ensure the new status is one of the allowed statuses for sitters
        this.statusUpdateException(
            !allowedStatuses.includes(status),
            `A pet sitter can only set the status to ${allowedStatuses.join(', ')}`
        );

        // Handle status-specific logic
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

    /**
     * Edits a booking's status, handling validation and updating
     * as per the user's role (owner or sitter).
     *
     * @param {string} user_id - The ID of the user (owner or sitter).
     * @param {string} booking_id - The ID of the booking to update.
     * @param {string} status - The new status for the booking.
     * @throws {ForbiddenRequest} - If the status change is invalid.
     * @returns the updated booking.
     */
    public editBooking = async (user_id: string, booking_id: string, status: string) => {
        const booking = await this.getBooking(user_id, booking_id);

        // Ensure the booking has not been completed, cancelled, or rejected
        this.statusUpdateException(
            ['REJECTED', 'CANCELLED', 'COMPLETED'].includes(booking.status),
            "A booking that's been 'rejected', 'cancelled', or 'completed' is not updatable"
        );

        const userRole = booking.owner.id === user_id ? "OWNER" : "SITTER";

        // Handle logic based on the user's role (sitter or owner)
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

    /**
     * Compares two dates and returns the difference in days.
     *
     * @param {Date} date1 - The first date to compare.
     * @param {Date | null} [date2] - (Optional) The second date to compare
     * (defaults to today if null).
     * @returns the difference in days between the two dates.
     */
    private dateCompare = (date1: Date, date2: Date | null = null) => {
        if (!date2) {
            date2 = new Date();
            date2.setHours(0, 0, 0, 0);
        }
        const diffInMilliseconds = date1.getTime() - date2.getTime();

        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        return diffInMilliseconds / millisecondsPerDay;
    }

    /**
     * Deletes a booking if it is in the 'PENDING', 'CANCELLED', or 'REJECTED' status.
     * If there is an associated payment, the payment is also deleted.
     *
     * @param {string} user_id - The ID of the user attempting to delete the booking.
     * @param {string} booking_id - The ID of the booking to delete.
     * @throws {ForbiddenRequest} - If the booking status is not cancellable.
     * @throws {AppError} - If the deletion of the booking or payment fails.
     */
    public deleteBooking = async (user_id: string, booking_id: string) => {
        const booking = await this.getBooking(user_id, booking_id);

        // Only allow deletion for 'CANCELLED', 'PENDING', or 'REJECTED' bookings
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

    /**
     * @throws an error if the deletion of an entity (booking or payment) fails.
     *
     * @param {boolean} exists - Whether the entity still exists after
     * attempting to delete it.
     * @param {string} entity - The name of the entity that was being
     * deleted (e.g., 'booking', 'payment').
     * @throws {AppError} - If the entity still exists after deletion.
     */
    private deleteFailed = (exists: boolean, entity: string) => {
        if (exists)
            throw new AppError(
                `Failed to delete ${entity}`, 500,
                {failed: "delete", reason: "Unknown"}
            );
    }

    /**
     * Adds a payment to a booking if the user is the owner and the booking is in
     * the 'ACCEPTED' status. The payment is based on the sitter's fee, the duration
     * of the booking, and the number of pets.
     *
     * @param {string} user_id - The ID of the user (owner) attempting to add a payment.
     * @param {string} booking_id - The ID of the booking to add a payment to.
     * @throws {ForbiddenRequest} - If the user is not the owner or the booking status is invalid.
     * @throws {ConflictError} - If a payment has already been issued or if the sitter has no service fee set.
     * @returns the updated booking with the new payment and status.
     */
    public addPayment = async (user_id: string, booking_id: string) => {
        const booking = await this.getBooking(user_id, booking_id);

        // Ensure the user is the owner
        if (booking.sitter.id === user_id) {
            throw new ForbiddenRequest(
                "Could not create payment",
                {failed : 'create', reason: "Only owners can issue payments for services"}
            );
        }

        // Ensure the booking status is 'ACCEPTED'
        if (booking.status !== 'ACCEPTED') {
            const msg = booking.status === "ACTIVE" ? "is already" : "had been";
            throw new ForbiddenRequest(
                "Could not issue payment",
                {failed : 'create', reason: `This booking ${msg} '${booking.status}'`}
            );
        }

        // Check if a payment has already been issued
        if (booking.payment) {
            throw new ConflictError("Couldn't create payment", {
                failed: "create", reason: "A payment has already been issued for this booking"
            });
        }

        // Ensure the sitter has set a service fee
        if (!booking.sitter.fee) {
            throw new ConflictError("Couldn't create payment", {
                failed: "create", reason: "A payment cannot be issued to a sitter that hasn't set a service fee"
            });
        }

        // Calculate the payment amount based on the sitter's fee, the duration, and number of pets
        const amount = this.dateCompare(booking.end_date, booking.start_date) * booking.sitter.fee * booking.pets.length;
        const transaction_id = uuidV4(); // Generate a transaction ID

        // Create the payment and update the booking status
        booking.payment = Payment.create({amount: amount, transaction_id: transaction_id});
        booking.status = "ACTIVE";

        await this.cancelAllConflictingBookings(booking); // Cancel all conflicting bookings

        // Save the booking with the new payment
        return this.repository.save(booking);
    }

    /**
     * Cancels all conflicting bookings that overlap with the current booking's time period.
     *
     * @param {Booking} booking - The booking for which conflicts are being checked.
     * @throws {AppError} - If any conflicting booking cannot be cancelled.
     */
    private cancelAllConflictingBookings = async (booking: Booking) => {
        // Fetch conflicting bookings for the sitter
        const conflictingBookings = await this.userBookingConflicts(
            booking.sitter.id, 'sitter',
            ["PENDING", "ACCEPTED"],
            booking.start_date, booking.end_date
        );

        // Fetch conflicts for each pet in the booking
        for (const pet of booking.pets) {
            const conflicts = await this.petConflicts(
                pet.id, ['PENDING', 'ACCEPTED'],
                booking.start_date, booking.end_date
            );
            conflictingBookings.push(...conflicts);
        }

        // Cancel all conflicting bookings
        for (const conflict of conflictingBookings) {
            conflict.status = "CANCELLED";
            await this.repository.save(conflict); // Save each cancelled booking
        }
    }
}