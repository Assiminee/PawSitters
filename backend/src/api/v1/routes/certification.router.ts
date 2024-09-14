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
        const controller = new CertificationController();
        const certifications = await controller.getCerts(req.params.user_id);

        res.status(200).json(
            (certifications as Certification[]).map(cert => controller.getCertInfo(cert))
        );
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

certificationRouter.get<'/:cert_id', MergedParams>('/:cert_id', async (req, res) => {
    try {
        const controller = new CertificationController();
        const certification = await controller
            .getCerts(req.params.user_id, req.params.cert_id);

        res.status(200).json(controller.getCertInfo(certification as Certification));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

certificationRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const controller = new CertificationController();
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['role', 'certifications']);
        const cert = await controller.createCertifications(
            user, validateBody({...req.body})
        );

        res.status(201).json(controller.getCertInfo(cert));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

certificationRouter.put<'/:cert_id', MergedParams>('/:cert_id', ensureJsonContentType, async (req, res) => {
    try {
        const controller = new CertificationController();
        const cert = await controller.updateCert(
            req.params.user_id, req.params.cert_id, validateBody({...req.body})
        );

        res.status(200).json(controller.getCertInfo(cert));
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