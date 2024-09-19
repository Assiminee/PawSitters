import {BaseController} from "./base.controller";
import {Certification} from "../../../orm/entities/Certification";
import {User} from "../../../orm/entities/User";
import {AppError, ForbiddenRequest, NotFoundError} from "../errors/Errors";
import {UserController} from "./user.controller";

/**
 * CertificationController class extends BaseController to manage Certification-related operations.
 */
export class CertificationController extends BaseController<Certification> {
    constructor() {
        super(Certification);

        // Specifies the columns that are required and allowed for certifications.
        this.entityColumns.required_columns = [
            'title', 'issue_date', 'organization'
        ];
        this.entityColumns.allowed_columns = this.entityColumns.required_columns;
    }

    /**
     * Gets minimal information about a certification along with minimal user info.
     *
     * @param cert : Certification - The certification entity.
     * @returns {object} - Certification info with user minimal info.
     */
    public getCertInfo = (cert: Certification): object => {
        return {
            ...cert,
            user: cert.user.getMinimalInfo() // Gets minimal information for the user
        };
    }

    /**
     * Gets certifications for a user. Can return all certifications or a specific certification.
     *
     * @param {string} user_id - The ID of the user whose certifications are to be retrieved.
     * @param {string | null} cert_id - (Optional) The ID of a specific certification to retrieve.
     * @returns all certifications or the specific certification.
     * @throws {NotFoundError} - If the user does not have the role 'SITTER' or the certification is not found.
     */
    public getCerts = async (user_id: string, cert_id: string | null = null) => {
        const user = await (new UserController())
            .getEntityById(user_id, ['role', 'certifications', 'certifications.user']);

        // Ensure the user has the role 'SITTER' to have certifications
        if (user.role.role !== "SITTER") {
            throw new NotFoundError(
                "Certifications not found",
                {error: "Only users with the role 'SITTER' have certifications"}
            );
        }

        // Return all certifications if no specific certification ID is provided
        if (!cert_id)
            return user.certifications;

        // Find the specific certification by its ID
        const cert = user.certifications.find(certification => certification.id === cert_id);

        // Throw error if the certification is not found
        if (!cert) {
            throw new NotFoundError(
                "Certification not found",
                {not_found: `Invalid id ${cert_id}`}
            );
        }
        return cert;
    }

    /**
     * Create a new certification for a user.
     *
     * @param {User} user - The user who is creating the certification.
     * @param {object} data - The certification data.
     * @returns the newly created certification.
     * @throws {ForbiddenRequest} - If the user does not have the role 'SITTER'.
     */
    public createCertifications = async (user: User, data: object) => {
        // Ensure the user is a sitter
        if (user.role.role !== "SITTER") {
            throw new ForbiddenRequest(
                "Couldn't create certification",
                {failed: "create", reason: "Only users with the role 'SITTER' can have certifications"}
            );
        }

        // Validate certification data
        this.checkData(data);
        this.checkDate(data, 'issue_date');

        // Add user to the certification data and create the entity
        data = {...data, user: user};
        const cert = this.repository.create(data);

        // Validate the created certification
        await this.propertyValidation(cert, "Couldn't create certification");

        // Save the certification and return it
        return this.repository.save(cert);
    }

    /**
     * Update an existing certification for a user.
     *
     * @param {string} user_id - The ID of the user who owns the certification.
     * @param {string} cert_id - The ID of the certification to update.
     * @param {object} data - The updated certification data.
     * @returns the updated certification.
     * @throws {NotFoundError} - If the certification is not found.
     */
    public updateCert = async (user_id: string, cert_id: string, data: object) => {
        const cert = await this.getCerts(user_id, cert_id); // Retrieve the certification

        // Validate the update data
        this.hasInvalidColumns(data);
        this.checkDate(data, 'issue_date');

        // Update the certification with new data
        this.updateProperties(cert as Certification, data);

        // Validate the updated certification
        await this.propertyValidation(cert, "Couldn't update certification");

        // Save the updated certification and return it
        return this.repository.save(cert);
    }

    /**
     * Delete a certification for a user.
     *
     * @param {string} user_id - The ID of the user who owns the certification.
     * @param {string} cert_id - The ID of the certification to delete.
     * @throws {AppError} - If the certification cannot be deleted.
     */
    public deleteCert = async (user_id: string, cert_id: string) => {
        const cert = await this.getCerts(user_id, cert_id);

        // Remove the certification
        await this.repository.remove(cert as Certification);

        // Check if the certification still exists after deletion
        const exists = await this.repository.existsBy({id: cert_id});
        if (exists)
            throw new AppError("Couldn't delete certification", 500, {
                failed: "delete", reason: "Unknown"
            });
    }
}