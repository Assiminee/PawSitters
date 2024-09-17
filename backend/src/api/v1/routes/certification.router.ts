import {Router} from 'express';
import {resData} from "./helperFunctions";
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

export default certificationRouter;