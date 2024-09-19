import {Router} from 'express';
import {ensureJsonContentType, resData, validateBody} from "./helperFunctions";
import {BreedController} from "../controllers/breed.controller";
import {SpeciesController} from "../controllers/species.controller";

// Type definitions for route parameters
type SpeciesParam = { species_id: string };
type MergedParams = SpeciesParam & { breed_id : string };

// Create a new Router instance with parameter merging enabled
const breedRouter = Router({mergeParams: true});

/**
 * @route GET /api/v1/species/:species_id/breeds
 * @param {string} species_id - The ID of the species to retrieve breeds for.
 * @description Retrieves all breeds associated with a specific species, including the count of pets for each breed.
 * @returns {object[]} An array of breed objects, each with the number of pets associated with the breed.
 */
breedRouter.get<'/', SpeciesParam>('/', async (req, res) => {
    try {
        const species = await (new SpeciesController())
            .getEntityById(req.params.species_id, ["breeds", "breeds.pets"]);

        res.status(200).json(species.breeds.map(breed => {return {...breed, pets: breed.pets.length}}));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route GET /api/v1/species/:species_id/breeds/:breed_id
 * @param {string} species_id - The ID of the species to which the breed belongs.
 * @param {string} breed_id - The ID of the breed to retrieve.
 * @description Retrieves a specific breed by its ID, including the count of pets associated with that breed.
 * @returns {object} The breed object with the number of pets associated with the breed.
 */
breedRouter.get<'/:breed_id', MergedParams>('/:breed_id', async (req, res) => {
    try {
        const species = await (new SpeciesController())
            .getEntityById(req.params.species_id, ["breeds", "breeds.pets"]);
        const breed = await (new BreedController())
            .getBreedById(species, req.params.breed_id);

        res.status(200).json({...breed, pets: breed.pets.length});
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route POST /api/v1/species/:species_id/breeds
 * @param {string} species_id - The ID of the species to which the new breed will be added.
 * @param {object} body - The breed data to be created. Should include necessary breed details.
 * @description Creates a new breed for the specified species.
 * @returns {object} The newly created breed object with a pet count of 0.
 */
breedRouter.post<'/', SpeciesParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const species = await (new SpeciesController())
            .getEntityById(req.params.species_id);
        const breed = await (new BreedController())
            .createBreed(species, validateBody({...req.body}));

        res.status(201).json({...breed, pets: 0});
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route PUT /api/v1/species/:species_id/breeds/:breed_id
 * @param {string} species_id - The ID of the species to which the breed belongs.
 * @param {string} breed_id - The ID of the breed to update.
 * @param {object} body - The updated breed data. Should include necessary breed details.
 * @description Updates a specific breed for the given species.
 * @returns {object} The updated breed object.
 */
breedRouter.put<'/:breed_id', MergedParams>('/:breed_id', ensureJsonContentType, async (req, res) => {
    try {
        const species = await (new SpeciesController())
            .getEntityById(req.params.species_id, ["breeds", "breeds.species", "breeds.pets"]);
        const breed = await (new BreedController())
            .updateBreed(species, req.params.breed_id, validateBody({...req.body}));

        res.status(200).json(breed);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * @route DELETE /api/v1/species/:species_id/breeds/:breed_id
 * @param {string} species_id - The ID of the species to which the breed belongs.
 * @param {string} breed_id - The ID of the breed to delete.
 * @description Deletes a specific breed from the given species.
 * @returns {void} Status code 204 (No Content) if the deletion was successful.
 */
breedRouter.delete<'/:breed_id', MergedParams>('/:breed_id', async (req, res) => {
    try {
        const species = await (new SpeciesController())
            .getEntityById(req.params.species_id, ["breeds", "breeds.pets"]);

        await (new BreedController()).deleteBreed(species, req.params.breed_id);
        res.status(204).send()
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default breedRouter;