import {Router} from 'express';
import {
    bookingQuery,
    ensureJsonContentType,
    resData, validateBody
} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {BookingController} from "../controllers/booking.controller";
import {ReviewController} from "../controllers/review.controller";

// Type definitions for route parameters
type UserParam = { user_id: string };
type UserBookingParams = UserParam & { booking_id: string };
type reviewParams = UserBookingParams & { review_id: string };

// Create a new Router instance with parameter merging enabled
const bookingRouter = Router({mergeParams: true});

/**
 * @route GET /api/v1/users/:user_id/bookings
 * @param {string} user_id - The ID of the user whose bookings are to be retrieved.
 * @description Retrieves all bookings associated with a specific user.
 * @returns {object[]} An array of booking objects, each containing detailed booking information.
 */
bookingRouter.get<'/', UserParam>('/', async (req, res) => {
        try {
            const controller = new BookingController();
            const bookings = await controller.getBookings(
                req.params.user_id, new UserController()
            );

            res.status(200).json(bookings.map(booking => controller.getBookingInfo(booking)));
        } catch
            (err) {
            const [code, json] = resData(err);
            res.status(code).json(json);
        }
    }
)

/**
 * @route GET /api/v1/users/:user_id/bookings/:booking_id
 * @param {string} user_id - The ID of the user who owns the booking.
 * @param {string} booking_id - The ID of the booking to retrieve.
 * @description Retrieves a specific booking by its ID for a given user.
 * @returns {object} The booking object with detailed booking information.
 */
bookingRouter.get<'/:booking_id', UserBookingParams>('/:booking_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const booking_id = req.params.booking_id;
        const controller = new BookingController();
        const booking = await controller.getBooking(user_id, booking_id);

        res.status(200).json(controller.getBookingInfo(booking));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route POST /api/v1/users/:user_id/bookings
 * @param {string} user_id - The ID of the user creating the booking.
 * @param {object} body - The booking data to be created. Should include necessary booking details.
 * @description Creates a new booking for the specified user.
 * @returns {object} The newly created booking object with detailed booking information.
 */
bookingRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const controller = new BookingController();
        const booking = await controller.createBooking(
            req.params.user_id,
            validateBody({...req.body})
        );
        res.status(201).json(controller.getBookingInfo(booking));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }

});

/**
 * @route PUT /api/v1/users/:user_id/bookings/:booking_id
 * @param {string} user_id - The ID of the user who owns the booking.
 * @param {string} booking_id - The ID of the booking to update.
 * @param {string} status - The new status to set for the booking.
 * @description Updates the status of a specific booking.
 * @returns {object} The updated booking object with detailed booking information.
 */
bookingRouter.put<'/:booking_id', UserBookingParams>('/:booking_id', bookingQuery, async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const booking_id = req.params.booking_id;
        const status= req.query.status as string;
        const controller = new BookingController();
        const booking = await controller.editBooking(user_id, booking_id, status);

        res.status(200).json(controller.getBookingInfo(booking));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
})

/**
 * @route DELETE /api/v1/users/:user_id/bookings/:booking_id
 * @param {string} user_id - The ID of the user who owns the booking.
 * @param {string} booking_id - The ID of the booking to delete.
 * @description Deletes a specific booking for the given user.
 * @returns {void} Status code 204 (No Content) if the deletion was successful.
 */
bookingRouter.delete<'/:booking_id', UserBookingParams>('/:booking_id', async (req, res) => {
    try {
        await (new BookingController()).deleteBooking(req.params.user_id, req.params.booking_id);
        res.status(204).json();
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route POST /api/v1/users/:user_id/bookings/:booking_id/payment
 * @param {string} user_id - The ID of the user who owns the booking.
 * @param {string} booking_id - The ID of the booking to add payment to.
 * @description Adds a payment to a specific booking.
 * @returns {object} The payment information associated with the booking.
 */
bookingRouter.post<'/:booking_id/payment', UserBookingParams>('/:booking_id/payment', async (req, res) => {
    try {
        const booking = await (new BookingController())
            .addPayment(req.params.user_id, req.params.booking_id);

        res.status(200).json(booking.payment);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route GET /api/v1/users/:user_id/bookings/:booking_id/payment
 * @param {string} user_id - The ID of the user who owns the booking.
 * @param {string} booking_id - The ID of the booking to retrieve payment information for.
 * @description Retrieves payment information for a specific booking.
 * @returns {object} The payment information associated with the booking, or an empty object if no payment is present.
 */
bookingRouter.get<'/:booking_id/payment', UserBookingParams>('/:booking_id/payment', async (req, res) => {
    try {
        const booking = await (new BookingController())
            .getBooking(req.params.user_id, req.params.booking_id);

        res.status(200).json(booking.payment ?? {});
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route POST /api/v1/users/:user_id/bookings/:booking_id/reviews
 * @param {string} user_id - The ID of the user who is writing the review.
 * @param {string} booking_id - The ID of the booking being reviewed.
 * @param {object} body - The review data to be created. Should include necessary review details.
 * @description Creates a new review for a specific booking.
 * @returns {object} The newly created review object.
 */
bookingRouter.post<'/:booking_id/reviews', UserBookingParams>('/:booking_id/reviews', async (req, res) => {
    try {
        const review = await (new ReviewController())
            .createReview(req.params.user_id, req.params.booking_id, validateBody({...req.body}));

        res.status(200).json(review);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route GET /api/v1/users/:user_id/bookings/:booking_id/reviews
 * @param {string} user_id - The ID of the user who owns the booking.
 * @param {string} booking_id - The ID of the booking whose reviews are to be retrieved.
 * @description Retrieves all reviews for a specific booking.
 * @returns {object[]} An array of review objects with minimal information about the reviewer and reviewed entities.
 */
bookingRouter.get<'/:booking_id/reviews', UserBookingParams>('/:booking_id/reviews', async (req, res) => {
    try {
        const booking = await (new BookingController())
            .getBooking(req.params.user_id, req.params.booking_id);
        let reviews = {};

        if (booking.reviews) {
            reviews = booking.reviews.map(review => {
                return {
                    ...review, reviewer: review.reviewer.getMinimalInfo(),
                    reviewed: review.reviewed.getMinimalInfo()
                };
            })
        }
        res.status(200).json(reviews);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route GET /api/v1/users/:user_id/bookings/:booking_id/reviews/:review_id
 * @param {string} user_id - The ID of the user who owns the booking.
 * @param {string} booking_id - The ID of the booking whose reviews is to be retrieved.
 * @param {string} review_id - The ID of the review that's being retrieved.
 * @description Retrieves a specific review for a specific booking.
 * @returns {object} the review object with minimal information about the reviewer and reviewed entities.
 */
bookingRouter.get<'/:booking_id/reviews/:review_id', reviewParams>('/:booking_id/reviews/:review_id', async (req, res) => {
    try {
        const booking = await (new BookingController())
            .getBooking(req.params.user_id, req.params.booking_id);

        const review = booking.reviews.find(review => review.id === req.params.review_id);
        if (!review) {
            res.status(404).json({not_found: `Invalid id ${req.params.review_id}`});
            return;
        }

        res.status(200).json({
            ...review, reviewer: review.reviewer.getMinimalInfo(),
            reviewed: review.reviewed.getMinimalInfo()
        });
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default bookingRouter;

