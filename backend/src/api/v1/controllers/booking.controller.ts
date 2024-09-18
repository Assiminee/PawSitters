import {BaseController} from "./base.controller";
import {Booking} from "../../../orm/entities/Booking";
import {User} from "../../../orm/entities/User";
import {NotFoundError} from "../errors/Errors";
import {In, LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import {Pet} from "../../../orm/entities/Pet";
import {UserController} from "./user.controller";
import {Address} from "../../../orm/entities/Address";

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

    private isAdmin = (role: string) => {
        if (role === "ADMIN") {
            throw new NotFoundError(
                "Bookings not found",
                {not_found: `Invalid user role`}
            );
        }
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

    public getBookings = async (id: string, userController: UserController) => {
        const user = await User.findOne({
            where: {id: id},
            select: ['id', 'role', 'account_stat'],
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
                `${root}.owner.address`, `${root}.sitter.address`,
                `${root}.reviews`
            ]
        );
        const bookings = userWithBookings[root];

        for await (const booking of bookings) {
            if (!booking.sitter.address) {
                const address = await Address.findOneBy({user: {id: booking.sitter.id}});
                if (address) booking.sitter.address = address;
            }
            if (!booking.owner.address) {
                const address = await Address.findOneBy({user: {id: booking.owner.id}});
                if (address) booking.owner.address = address;
            }
        }

        return bookings;
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

}