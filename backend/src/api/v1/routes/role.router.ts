import {Router} from "express";
import {Role} from "../../../orm/entities/Role";
import {BaseController} from "../controllers/base.controller";
import {resData} from "./helperFunctions";

// Create a router instance for role-related routes
const roleRouter = Router();

/**
 * Route handler for getting all roles.
 *
 * - Retrieves all roles from the database with their associated users.
 * - Returns a 200 status code with the roles data if successful.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
roleRouter.get('/', async (req, res) => {
    try {
        const roles = await Role.find({relations : ["users"]});
        res.status(200).json(roles);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

/**
 * Route handler for getting a specific role by ID.
 *
 * - Retrieves the role specified by `role_id` along with its associated users.
 * - Returns a 200 status code with the role data if successful.
 * - Returns an error response if an error occurs.
 *
 * @param {Request<{ role_id: string }>} req - The HTTP request object containing `role_id` parameter.
 * @param {Response} res - The HTTP response object.
 */
roleRouter.get('/:role_id', async (req, res) => {
    try {
        const role = await (new BaseController(Role))
            .getEntityById(req.params.role_id, ['users']);

        res.status(200).json(role);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default roleRouter;