import {Router} from 'express';
import {ensureJsonContentType, resData, validateBody} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {AddressController} from "../controllers/address.controller";
import {CertificationController} from "../controllers/certification.controller";
import {Certification} from "../../../orm/entities/Certification";

type UserParam = { user_id: string };
type MergedParams = UserParam & { cert_id: string };

const certificationRouter = Router({mergeParams: true});

certificationRouter.get<'/', UserParam>('/', async (req, res) => {
    try {
        const certifications = await (new CertificationController())
            .getCerts(req.params.user_id);

        res.status(200).json(certifications);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

certificationRouter.get<'/:cert_id', MergedParams>('/:cert_id', async (req, res) => {
    try {
        const certification = await (new CertificationController())
            .getCerts(req.params.user_id, req.params.cert_id);

        res.status(200).json(certification);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

certificationRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['role', 'certifications']);
        const cert = await (new CertificationController())
            .createCertifications(user, validateBody({...req.body}));

        res.status(201).json(cert);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

certificationRouter.put<'/:cert_id', MergedParams>('/:cert_id', ensureJsonContentType, async (req, res) => {
    try {
        const cert = await (new CertificationController())
            .updateCert(req.params.user_id, req.params.cert_id, validateBody({...req.body}));

        res.status(200).json(cert);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

certificationRouter.delete<'/:cert_id', MergedParams>('/:cert_id', async (req, res) => {
    try {
        await (new CertificationController()).deleteCert(req.params.user_id, req.params.cert_id);

        res.status(204).send();
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default certificationRouter;