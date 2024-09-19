import {Router} from 'express';
import {ensureJsonContentType, resData, validateBody} from "./helperFunctions";
import {UserController} from "../controllers/user.controller";
import {CertificationController} from "../controllers/certification.controller";
import {Certification} from "../../../orm/entities/Certification";

// Type definitions for route parameters
type UserParam = { user_id: string };
type MergedParams = UserParam & { cert_id: string };

// Create a new Router instance with parameter merging enabled
const certificationRouter = Router({mergeParams: true});

/**
 * @route GET /api/v1/users/:user_id/certifications
 * @param {string} user_id - The ID of the user whose certifications are to be retrieved.
 * @description Retrieves all certifications associated with a specific user.
 * @returns {object[]} An array of certification objects.
 */
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

/**
 * @route GET /api/v1/users/:user_id/certifications/:cert_id
 * @param {string} user_id - The ID of the user whose certification is to be retrieved.
 * @param {string} cert_id - The ID of the certification to retrieve.
 * @description Retrieves a specific certification by its ID for the given user.
 * @returns {object} The certification object with relevant information.
 */
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

/**
 * @route POST /api/v1/users/:user_id/certifications
 * @param {string} user_id - The ID of the user for whom a new certification is to be created.
 * @param {object} body - The certification data to be created. Should include necessary certification details.
 * @description Creates a new certification for the specified user.
 * @returns {object} The newly created certification object.
 */
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

/**
 * @route PUT /api/v1/users/:user_id/certifications/:cert_id
 * @param {string} user_id - The ID of the user whose certification is to be updated.
 * @param {string} cert_id - The ID of the certification to update.
 * @param {object} body - The updated certification data. Should include necessary certification details.
 * @description Updates a specific certification for the given user.
 * @returns {object} The updated certification object.
 */
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

/**
 * @route DELETE /api/v1/users/:user_id/certifications/:cert_id
 * @param {string} user_id - The ID of the user whose certification is to be deleted.
 * @param {string} cert_id - The ID of the certification to delete.
 * @description Deletes a specific certification for the given user.
 * @returns {void} Status code 204 (No Content) if the deletion was successful.
 */
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