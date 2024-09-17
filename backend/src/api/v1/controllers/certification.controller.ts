import {BaseController} from "./base.controller";
import {Certification} from "../../../orm/entities/Certification";
import {NotFoundError} from "../errors/Errors";
import {UserController} from "./user.controller";

export class CertificationController extends BaseController<Certification> {
    constructor() {
        super(Certification);
        this.entityColumns.required_columns = [
            'title', 'issue_date', 'organization'
        ];
        this.entityColumns.allowed_columns = this.entityColumns.required_columns;
    }

    public getCertInfo = (cert: Certification) => {
        return {
            ...cert,
            user: cert.user.getMinimalInfo()
        };
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
}