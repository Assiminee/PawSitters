import {Router} from 'express';
import {resData} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {AddressController} from "../controllers/address.controller";

type UserParam = { user_id: string };

const addressRouter = Router({mergeParams: true});

addressRouter.get<'/', UserParam>('/', async (req, res) => {
    try {
        const addressController = new AddressController();
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const json = user.address ? addressController.getAddressData(user.address) : {};

        res.status(200).json(json);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default addressRouter;