import {Router} from 'express';
import {ensureJsonContentType, resData, validateBody} from "./helperFunctions";
import {BreedController} from "../controllers/breed.controller";
import {SpeciesController} from "../controllers/species.controller";

type SpeciesParam = { species_id: string };
type MergedParams = SpeciesParam & { breed_id : string };

const breedRouter = Router({mergeParams: true});

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