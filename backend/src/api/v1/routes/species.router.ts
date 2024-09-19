import {Router} from 'express';
import {resData} from "./helperFunctions";
import breedRouter from "./breed.router";
import {SpeciesController} from "../controllers/species.controller";

const speciesRouter = Router();

/**
 * Route handler for retrieving all species.
 *
 * - Uses `SpeciesController` to get a list of all species from the database.
 * - Returns a 200 status code with the species data if successful.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
speciesRouter.get('/', async (req, res) => {
    try {
        const species = await (new SpeciesController()).getSpecies();

        res.status(200).json(species);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

/**
 * Route handler for retrieving a specific species by ID.
 *
 * - Uses `SpeciesController` to get the species specified by `species_id` from the database.
 * - Returns a 200 status code with the species data if successful.
 * - Returns a 500 status code with the error if an internal server error occurs.
 *
 * @param {Request<{ species_id: string }>} req - The HTTP request object containing `species_id` parameter.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 */
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

/**
 * Mounts the `breedRouter` on the path `/:species_id/breeds`.
 *
 * - Allows for breed-related routes to be handled under the species route.
 * - Example: `/species/:species_id/breeds` will be handled by `breedRouter`.
 */
speciesRouter.use("/:species_id/breeds", breedRouter);

export default speciesRouter;