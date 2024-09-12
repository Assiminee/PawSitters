import {Router} from "express";
import {Role} from "../../../orm/entities/Role";
import {BaseController} from "../controllers/base.controller";
import {resData} from "./helperFunctions";

const roleRouter = Router();

roleRouter.get('/', async (req, res) => {
    try {
        const roles = await Role.find({relations : ["users"]});
        res.status(200).json(roles);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

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