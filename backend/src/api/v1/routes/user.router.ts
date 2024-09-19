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

/**
 * Middleware to normalize query parameters.
 */
userRouter.use(normalizeQueryParams);

/**
 * Route handler for retrieving users.
 *
 * - Uses `availabilityQuery` to handle query parameters related to user availability.
 * - Uses `validateQuery` to validate query parameters.
 * - Fetches users based on availability or general criteria using `UserController`.
 * - Returns a 200 status code with the user data if successful.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
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

/**
 * Route handler for retrieving a specific user by ID.
 *
 * - Uses `UserController` to get user data by `user_id`.
 * - Returns a 200 status code with the user data if successful.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request<{ user_id: string }>} req - The HTTP request object containing `user_id` parameter.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
userRouter.get('/:user_id', async (req, res) => {
    try {
        const user = await (new UserController()).getUser(req.params.user_id);

        res.status(200).json(user);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler for creating a new user or logging in.
 *
 * - Uses `ensureJsonContentType` to ensure the request has JSON content.
 * - Uses `loginRegister` middleware to handle login and registration logic.
 * - Validates request body with `validateBody`.
 * - Creates a new user or logs in an existing user based on query parameters.
 * - Returns a 201 status code with the newly created user data or a 200 status code for login.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
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

/**
 * Route handler for uploading a user profile image.
 *
 * - Uses `upload.single('user_image')` middleware to handle file uploads.
 * - Retrieves the user by `user_id` using `UserController`.
 * - Removes the old image if it exists.
 * - Saves the new image path and updates the user record.
 * - Returns a 200 status code with updated user data if successful.
 * - Returns a 400 status code if no file is uploaded or 404 if the user is not found.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request<{ user_id: string }, any, any, any, { user_image: Express.Multer.File }>} req - The HTTP request object with file data.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
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

/**
 * Route handler for updating user details.
 *
 * - Uses `ensureJsonContentType` to ensure the request has JSON content.
 * - Validates request body with `validateBody`.
 * - Updates user details using `UserController`.
 * - Returns a 200 status code with the updated user data if successful.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request<{ user_id: string }, any, any>} req - The HTTP request object containing `user_id` and request body.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
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

/**
 * Route handler for deleting a user.
 *
 * - Deletes the user by `user_id` using `UserController`.
 * - Returns a 204 status code on successful deletion.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request<{ user_id: string }>} req - The HTTP request object containing `user_id` parameter.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
userRouter.delete('/:user_id', async (req, res) => {
    try {
        await (new UserController()).deleteUser(req.params.user_id);
        res.status(204).send();
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Mounts various routers for managing related resources under the user route.
 *
 * - `/user/:user_id/pets` will be handled by `petRouter`.
 * - `/user/:user_id/address` will be handled by `addressRouter`.
 * - `/user/:user_id/bookings` will be handled by `bookingRouter`.
 * - `/user/:user_id/certifications` will be handled by `certificationRouter`.
 */
userRouter.use('/:user_id/pets', petRouter);
userRouter.use('/:user_id/address', addressRouter);
userRouter.use('/:user_id/bookings', bookingRouter);
userRouter.use('/:user_id/certifications', certificationRouter);

export default userRouter;

