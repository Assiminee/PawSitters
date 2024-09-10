import {Router} from 'express';
import {ensureJsonContentType, resData, validateBody} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {AddressController} from "../controllers/address.controller";

type UserParam = { user_id: string };

const addressRouter = Router({mergeParams: true});

addressRouter.get<'/', UserParam>('/', async (req, res) => {
    try {
        const addressController = new AddressController();
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);

        if (user.address)
            res.status(200).json(addressController.getAddressData(user.address));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

addressRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const address = await (new AddressController())
            .createAddress(user, validateBody({...req.body}));

        res.status(201).json(address);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

addressRouter.put<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const address = await (new AddressController())
            .updateAddress(user, validateBody({...req.body}));

        res.status(200).json(address);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

addressRouter.delete<'/', UserParam>('/', async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['address', 'address.user']);
        const deleteResult = await (new AddressController())
            .deleteAddress(user);

        if (deleteResult.affected === 0) {
            res.status(500).json({failed : "delete", reason : "Unknown"});
            return;
        }
        res.status(204).send();
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default addressRouter;