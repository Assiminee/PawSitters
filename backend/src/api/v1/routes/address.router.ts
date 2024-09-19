import {Router} from 'express';
import {ensureJsonContentType, resData, validateBody} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {AddressController} from "../controllers/address.controller";

// Type for user ID parameter in route
type UserParam = { user_id: string };

// Create a new router instance with merged parameters
const addressRouter = Router({mergeParams: true});

/**
 * Route handler to get the address of a user.
 *
 * @param {string} user_id - The ID of the user whose address is to be retrieved.
 *
 * @route GET /{user_id}
 * @returns {object} - The address data of the user.
 * @throws {AppError} - Handles errors and sends appropriate HTTP status code and message.
 */
addressRouter.get<'/', UserParam>('/', async (req, res) => {
    try {
        const addressController = new AddressController();
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const json = user.address ? addressController.getAddressData(user.address) : {};

        res.status(200).json(json);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler to create a new address for a user.
 *
 * @param {string} user_id - The ID of the user for whom the address is to be created.
 * @param {object} request.body - The address data to be created.
 *
 * @route POST /{user_id}
 * @returns {object} - The created address data.
 * @throws {AppError} - Handles errors and sends appropriate HTTP status code and message.
 */
addressRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const address = await (new AddressController())
            .createAddress(user, validateBody({...req.body}));

        res.status(201).json(address);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler to update an existing address for a user.
 *
 * @param {string} user_id - The ID of the user whose address is to be updated.
 * @param {object} request.body - The updated address data.
 *
 * @route PUT /{user_id}
 * @returns {object} - The updated address data.
 * @throws {AppError} - Handles errors and sends appropriate HTTP status code and message.
 */
addressRouter.put<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const address = await (new AddressController())
            .updateAddress(user, validateBody({...req.body}));

        res.status(200).json(address);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler to delete the address of a user.
 *
 * @param {string} user_id - The ID of the user whose address is to be deleted.
 *
 * @route DELETE /{user_id}
 * @returns {void} - No content if successful.
 * @throws {AppError} - Handles errors and sends appropriate HTTP status code and message.
 */
addressRouter.delete<'/', UserParam>('/', async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const deleteResult = await (new AddressController())
            .deleteAddress(user);

        if (deleteResult.affected === 0) {
            res.status(500).json({failed: "delete", reason: "Unknown"});
            return;
        }
        res.status(204).send();
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default addressRouter;