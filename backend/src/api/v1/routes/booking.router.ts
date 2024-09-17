import {Router} from 'express';
import {
    resData
} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {BookingController} from "../controllers/booking.controller";

type UserParam = { user_id: string };
type UserBookingParams = UserParam & { booking_id: string };
type reviewParams = UserBookingParams & { review_id: string };

const bookingRouter = Router({mergeParams: true});

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

