import {Router} from 'express';
import petRouter from "./pet.router";
import {
    resData,
    validateQuery,
    normalizeQueryParams, availabilityQuery
} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import addressRouter from "./address.router";
import bookingRouter from "./booking.router";
import {User} from "../../../orm/entities/User";
import certificationRouter from "./certification.router";

const userRouter = Router();
userRouter.use(normalizeQueryParams);

userRouter.get('/', availabilityQuery, validateQuery, async (req, res) => {
    try {
        const controller = new UserController();
        let users: User[];
        if (req.query.availability)
            users = await controller.getAvailableSitters({...req.query});
        else
            users = await controller.getUsers(req.query);
        res.status(200).json(users);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

userRouter.get('/:user_id', async (req, res) => {
    try {
        const user = await (new UserController()).getUser(req.params.user_id);

        res.status(200).json(user);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

userRouter.use('/:user_id/pets', petRouter);
userRouter.use('/:user_id/address', addressRouter);
userRouter.use('/:user_id/bookings', bookingRouter);
userRouter.use('/:user_id/certifications', certificationRouter);

export default userRouter;

