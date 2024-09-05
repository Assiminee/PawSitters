import {Router} from 'express';
import {
    ensureJsonContentType,
    resData, validateBody
} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {BookingController} from "../controllers/booking.controller";
import {User} from "../../../orm/entities/User";
import {Booking} from "../../../orm/entities/Booking";

type UserParam = { user_id: string };
type MergedParams = UserParam & { booking_id: string };

const bookingRouter = Router({mergeParams: true});

bookingRouter.get<'/', UserParam>('/', async (req, res) => {
        try {
            const bookings = await (new BookingController())
                .getBookings(req.params.user_id, new UserController());

            res.status(200).json(bookings);
        } catch
            (err) {
            const [code, json] = resData(err);
            res.status(code).json(json);
        }
    }
)

bookingRouter.get<'/:booking_id', MergedParams>('/:booking_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const booking_id = req.params.booking_id;
        const booking = await (new BookingController())
            .getBooking(user_id, booking_id);

        res.status(200).json(booking);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

bookingRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const booking = await (new BookingController()).createBooking(
            req.params.user_id,
            validateBody({...req.body})
        );
        res.status(201).json(booking);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }

});

bookingRouter.put<'/:payment_id', MergedParams>('/:payment_id', ensureJsonContentType, async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const booking_id = req.params.booking_id;
        const booking = await (new BookingController())
            .editBooking(user_id, booking_id, validateBody({...req.body}), (new UserController()));

        res.status(200).json(booking);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
})
//
// userRouter.put('/:user_id', ensureJsonContentType, async (req, res) => {
//     try {
//         const user = await (new UserController()).editUser(
//             req.params.user_id, validateBody({...req.body})
//         );
//         res.status(200).json(user);
//     } catch (err) {
//         const [code, json] = resData(err);
//         res.status(code).json(json);
//     }
// });
//
// userRouter.delete('/:user_id', async (req, res) => {
//     try {
//         await (new UserController()).deleteUser(req.params.user_id);
//         res.status(204).send();
//     } catch (err) {
//         const [code, json] = resData(err);
//         res.status(code).json(json);
//     }
// });
//
// userRouter.use('/:user_id/pets', petRouter);
// userRouter.use('/:user_id/address', addressRouter);

export default bookingRouter;

