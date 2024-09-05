import {Router} from 'express';
import {resData} from "./helperFunctions";
import breedRouter from "./breed.router";
import {BaseController} from "../controllers/base.controller";
import {Species} from "../../../orm/entities/Species";

const speciesRouter = Router();

speciesRouter.get('/', async (req, res) => {
    try {
        const species = await Species.find({
            relations: ["breeds"]
        });

        res.status(200).json(species);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

speciesRouter.get('/:species_id', async (req, res) => {
    try {
        const species = await (new BaseController(Species))
            .getEntityById(req.params.species_id, ["breeds"]);

        res.status(200).json(species);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

speciesRouter.use("/:species_id/breeds", breedRouter);

export default speciesRouter;