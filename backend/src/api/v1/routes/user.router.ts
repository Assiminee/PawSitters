import {Router} from 'express';
import petRouter from "./pet.router";
import {
    ensureJsonContentType,
    resData,
    validateBody,
    validateQuery,
    normalizeQueryParams, loginRegister, availabilityQuery
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
        let users : User[];
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

userRouter.post('/', ensureJsonContentType, loginRegister, async (req, res) => {
    try {
        const body = validateBody({...req.body});

        if ('login' in req.query) {
            const user = await (new UserController()).login(body);
            res.status(200).json(user);
            return;
        }

        const user = await (new UserController()).createUser(body);
        res.status(201).json(user);
    } catch (err) {
        console.error(req.body);
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

userRouter.put('/:user_id', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController()).editUser(
            req.params.user_id, validateBody({...req.body})
        );
        res.status(200).json(user);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

userRouter.delete('/:user_id', async (req, res) => {
    try {
        await (new UserController()).deleteUser(req.params.user_id);
        res.status(204).send();
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

