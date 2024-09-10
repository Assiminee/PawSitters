import {BaseController} from "./base.controller";
import {Certification} from "../../../orm/entities/Certification";
import {User} from "../../../orm/entities/User";
import {AppError, ForbiddenRequest, NotFoundError} from "../errors/Errors";
import {UserController} from "./user.controller";

export class CertificationController extends BaseController<Certification> {
    constructor() {
        super(Certification);
        this.entityColumns.required_columns = [
            'title', 'issue_date', 'organization'
        ];
        this.entityColumns.allowed_columns = this.entityColumns.required_columns;
    }

    public getCerts = async (user_id: string, cert_id: string | null = null) => {
        const user = await (new UserController())
            .getEntityById(user_id, ['role', 'certifications', 'certifications.user']);

        if (user.role.role !== "SITTER") {
            throw new NotFoundError(
                "Certifications not found",
                {error: "Only users with the role 'SITTER' have certifications"}
            );
        }

        if (!cert_id)
            return user.certifications;

        const cert = user.certifications.find(certification => certification.id === cert_id);

        if (!cert) {
            throw new NotFoundError(
                "Certification not found",
                {not_found: `Invalid id ${cert_id}`}
            );
        }
        return cert;
    }

    public createCertifications = async (user: User, data: object) => {
        if (user.role.role !== "SITTER") {
            throw new ForbiddenRequest(
                "Couldn't create certification",
                {failed: "create", reason: "Only users with the role 'SITTER' can have certifications"}
            );
        }
        this.checkData(data);
        this.checkDate(data, 'issue_date');

        data = {...data, user: user};
        const cert = this.repository.create(data);

        await this.propertyValidation(cert, "Couldn't create certification");

        return this.repository.save(cert);
    }

    public updateCert = async (user_id: string, cert_id: string, data: object) => {
        const cert = await this.getCerts(user_id, cert_id);
        this.hasInvalidColumns(data);
        this.checkDate(data, 'issue_date');
        this.updateProperties(cert as Certification, data);
        await this.propertyValidation(cert, "Couldn't update certification");
        return this.repository.save(cert);
    }

    public deleteCert = async (user_id: string, cert_id: string) => {
        const cert = await this.getCerts(user_id, cert_id);
        await this.repository.remove(cert as Certification);
        const exists = await this.repository.existsBy({id: cert_id});

        if (exists)
            throw new AppError("Couldn't delete certification", 500, {
                failed: "delete", reason: "Unknown"
            });
    }
}