import {Router} from 'express';
import {UserController} from "../controllers/user.controller";
import {ensureJsonContentType, resData, validateBody} from "./helperFunctions";
import {PetController} from "../controllers/pet.controller";

type UserParam = { user_id: string };
type MergedParams = UserParam & {pet_id: string};

const petRouter = Router({mergeParams: true});

petRouter.get<'/', UserParam>('/', async (req, res) => {
    try {
        const pets = await (new PetController())
            .findPets(req.params.user_id)

        res.status(200).json(pets);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

petRouter.get<'/:pet_id', MergedParams>('/:pet_id', async (req , res) => {
    try {
        const pet = await (new PetController())
            .findPetById(req.params.pet_id, req.params.user_id);

        res.status(200).json(pet);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
})

petRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['pets', 'pets.user', 'pets.breed', 'role']);
        const pet = await (new PetController())
            .createPet(validateBody({...req.body}), user);

        res.status(201).json(pet);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

petRouter.put<'/:pet_id', MergedParams>('/:pet_id', ensureJsonContentType, async (req, res) => {
    try {
        const pet = await (new PetController())
            .editPet(validateBody({...req.body}), req.params.user_id, req.params.pet_id);

        res.status(200).json(pet);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});


petRouter.delete<'/:pet_id', MergedParams>('/:pet_id', ensureJsonContentType, async (req, res) => {
    try {
        await (new PetController()).deletePet(req.params.user_id, req.params.pet_id);

        res.status(204).json();
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default petRouter;