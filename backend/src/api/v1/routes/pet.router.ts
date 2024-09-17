import {Router} from 'express';
import {resData} from "./helperFunctions";
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
        const controller = new PetController();
        const pet = await controller.findPetById(
            req.params.pet_id, req.params.user_id
        );

        res.status(200).json(controller.getPetData(pet));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default petRouter;