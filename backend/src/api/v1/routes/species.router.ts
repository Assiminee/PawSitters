import {Router} from 'express';
import {resData} from "./helperFunctions";
import breedRouter from "./breed.router";
import {SpeciesController} from "../controllers/species.controller";

const speciesRouter = Router();

speciesRouter.get('/', async (req, res) => {
    try {
        const species = await (new SpeciesController()).getSpecies();

        res.status(200).json(species);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

speciesRouter.get('/:species_id', async (req, res) => {
    try {
        const species = await (new SpeciesController())
            .getOneSpecies(req.params.species_id);

        res.status(200).json(species);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

speciesRouter.use("/:species_id/breeds", breedRouter);

export default speciesRouter;