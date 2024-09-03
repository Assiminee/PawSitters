import {Router} from "express";
import {Role} from "../../../orm/entities/Role";
import {BaseController} from "../controllers/base.controller";

const roleRouter = Router();

roleRouter.get('/', async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

roleRouter.get('/:role_id', async (req, res) => {
    try {
        const role = await (new BaseController(Role))
            .getEntityById(req.params.role_id);

        res.status(200).json(role);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

export default roleRouter;