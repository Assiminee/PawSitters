import {Router} from 'express';
import {resData} from "./helperFunctions";
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

export default breedRouter;