import {Router} from 'express';
import petRouter from "./pet.router";
import {
    ensureJsonContentType,
    resData,
    validateBody,
    validateQuery,
    normalizeQueryParams
} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import addressRouter from "./address.router";

const userRouter = Router();
userRouter.use(normalizeQueryParams);

userRouter.get('/', validateQuery, async (req, res) => {
    try {
        const users = await (new UserController()).getUsers(req.query);
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

userRouter.post('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController()).createUser(
            validateBody({...req.body})
        );
        res.status(201).json(user);
    } catch (err) {
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

userRouter.use('/:user_id/pets', petRouter);
userRouter.use('/:user_id/address', addressRouter);

export default userRouter;

