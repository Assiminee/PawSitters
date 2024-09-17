import {Router} from 'express';
import petRouter from "./pet.router";
import {
    ensureJsonContentType,
    resData,
    validateBody,
    validateQuery,
    normalizeQueryParams, loginRegister, availabilityQuery, uploads
} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import addressRouter from "./address.router";
import bookingRouter from "./booking.router";
import {User} from "../../../orm/entities/User";
import certificationRouter from "./certification.router";
import {upload} from "./helperFunctions";

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

userRouter.post('/', ensureJsonContentType, loginRegister, async (req, res) => {
    try {
        const controller = new UserController();
        const body = validateBody({...req.body});

        if ('login' in req.query) {
            const user = await controller.login(body);
            return res.status(200).json(user);
        }

        const user = await controller.createUser(body);
        res.status(201).json(user);
    } catch (err) {
        console.error(req.body);
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

userRouter.post('/:user_id/image', upload.single('user_image'), async (req, res) => {
    try {
        const controller = new UserController();
        const user = await controller.getUser(req.params.user_id);

        if (!user)
            return res.status(404).json({not_found: `Invalid id ${req.params.user_id}`});

        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded. Please upload a valid image.' });

        controller.removeImage(
            user.image_path ?
                uploads + user.image_path.substring(user.image_path.lastIndexOf('/')) :
                null
        );

        user.image_path = 'localhost:8081/public/uploads/' + req.file.filename;
        const savedUser = await controller.repository.save(user);
        res.status(200).json({
            ...savedUser.getMinimalInfo(),
            image_path: user.image_path
        });
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

