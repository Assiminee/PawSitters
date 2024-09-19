import {AppDataSource} from "../../../orm/data-source";
import {
    EntityMetadata,
    EntityTarget,
    FindOptionsWhere,
    Not,
    ObjectLiteral,
    Repository
} from "typeorm";
import {NotFoundError, InvalidDataError, ForbiddenRequest} from "../errors/Errors";
import {validate} from "class-validator";
import {BaseModel} from "../../../orm/entities/BaseModel";
import fs from "fs";

/**
 * Represents a standardized response format for JSON responses.
 * @interface JsonResponse
 * @property {number} errors - Number of errors encountered.
 * @property {object} existing_data - Data that already exists in the database.
 * @property {object} invalid_data - Invalid data provided by the user.
 * @property {string[]} missing_columns - List of required columns missing from the input.
 * @property {string[]} invalid_columns - List of columns not allowed in the input.
 */
export interface JsonResponse {
    errors: number;
    existing_data: object;
    invalid_data: object;
    missing_columns: string[];
    invalid_columns: string[];
}

/**
 * Interface that defines the key columns for entity validation.
 * @interface EntityColumns
 * @property {string[]} required_columns - Columns that must be present in the data.
 * @property {string[]} unique_columns - Columns that must have unique values.
 * @property {string[]} updatable_columns - Columns that can be updated.
 * @property {string[]} allowed_columns - Columns that are allowed in the data.
 */
export interface EntityColumns {
    required_columns: string[];
    unique_columns: string[];
    updatable_columns: string[];
    allowed_columns: string[];
}

/**
 * BaseController class provides reusable methods to handle CRUD operations, validations,
 * and error handling for TypeORM entities.
 * @template T
 */
export class BaseController<T extends ObjectLiteral> {
    public json: JsonResponse;
    public metaData: EntityMetadata;
    public repository: Repository<T>;
    protected cls: EntityTarget<T>;
    protected entityColumns : EntityColumns;

    /**
     * Initializes a new instance of the BaseController class.
     * @param {EntityTarget<T>} cls - The entity target class (e.g., User, Booking).
     */
    constructor(cls: EntityTarget<T>) {
        this.cls = cls;
        this.repository = AppDataSource.getRepository(this.cls);
        this.metaData = AppDataSource.getMetadata(this.cls);

        this.entityColumns = {
            required_columns: [],
            unique_columns: [],
            updatable_columns: [],
            allowed_columns: []
        }

        this.json = {
            errors: 0,
            existing_data: {},
            invalid_data: {},
            missing_columns: [],
            invalid_columns: []
        };
    }

    /**
     * Removes an image file from the file system.
     * @param {string | null | undefined} path - The path to the image file.
     */
    public removeImage = (path: string | null | undefined) => {
        if (!path)
            return;

        fs.unlink(path, err => {
            err ? console.error(err) : console.log("Image deleted");
        });
    }

    /**
     * Checks if the provided value is an array of non-empty strings.
     * @param {*} arr - The value to be checked.
     * @returns {boolean} True if the array contains only valid strings, otherwise false.
     */
    protected isArrayOfValidStrings = (arr: any) : boolean => {
        return Array.isArray(arr) && arr.length > 0 &&
            arr.every(item => (typeof item === 'string' && item.length > 0));
    }

    /**
     * Updates properties of an entity with the provided data.
     * @param {BaseModel} entity - The entity to be updated.
     * @param {object} data - The data object containing the properties to update.
     */
    protected updateProperties = (entity: BaseModel, data: object) => {
        for (const [key, value] of Object.entries(data))
            entity[key] = value;
    }

    /**
     * Validates the provided data by checking for invalid or missing columns.
     * @param {object} data - The data to be validated.
     */
    protected checkData = (data: object) => {
        this.hasInvalidColumns(data);
        this.hasRequiredColumns(data);
    }

    /**
     * Validates if the specified date field in the data object has a valid format.
     * If the date is invalid, it appends an error to the JSON response.
     * @param {object} data - The data object containing the date.
     * @param {string} key - The key of the date field.
     */
    protected checkDate = (data: object, key : string) => {
        if (!(key in data))
            return;

        const dateString = (data as any)[key] as string;
        const date = new Date(dateString);

        if (isNaN(date.getTime()))
            this.appendInvalidData({[key]: `Invalid date format: ${dateString}` });
        else
            (data as any)[key] = date;
    }

    /**
     * Appends an invalid data error to the JSON response.
     * @param {object} error - The invalid data error object.
     */
    protected appendInvalidData = (error: object) => {
        this.json.errors++;
        this.json.invalid_data = {
            ...this.json.invalid_data,
            ...error
        };
    }

    /**
     * Appends a missing data error to the JSON response.
     * @param {string} error - The missing column name.
     */
    protected appendMissingData = (error: string) => {
        this.json.errors++;
        this.json.missing_columns.push(error);
    }

    /**
     * Checks if the data contains any fields that are not allowed for updating.
     *
     * @param {object} data - The data object containing the properties to update.
     * @throws {ForbiddenRequest} If there are fields that are not updatable.
     */
    protected forbiddenUpdate = (data: object) => {
        const allowed = this.entityColumns.updatable_columns;
        const forbidden = Object.keys(data).filter(key => !allowed.includes(key));

        if (forbidden.length > 0) {
            const message = 'Attempting to edit fields ' + forbidden.join(', ') + '. ' +
                'Can only edit fields ' + allowed.join(', ');
            throw new ForbiddenRequest(message, {failed: 'update'});
        }
    }

    /**
     * Validates the properties of an entity using class-validator.
     * Appends errors to the JSON response if any constraints are violated.
     * @param {any} entity - The entity to validate.
     * @param {string} message - The error message to throw if validation fails.
     * @throws {InvalidDataError} If validation fails.
     */
    protected propertyValidation = async (entity: any, message: string) => {
        const validationResults = await validate(entity);

        for (const validationResult of validationResults) {
            const constraints = validationResult.constraints;

            if (constraints === undefined)
                continue;

            if ("isNotEmpty" in constraints) {
                this.appendInvalidData({
                    [validationResult.property]: `${validationResult.property} can't be empty`
                });
                continue;
            }

            this.json.invalid_data = {
                ...this.json.invalid_data,
                [validationResult.property]: Object.values(constraints)[0]
            };
            this.json.errors++;
        }

        if (this.json.errors > 0)
            throw new InvalidDataError(message, this.json);
    }

    /**
     * Checks if the required columns are present in the data.
     * Appends errors to the JSON response if any required columns are missing.
     * @param {object} data - The data to be checked.
     */
    private hasRequiredColumns = (data: object) => {
        const missingColumns = (this.entityColumns.required_columns)
            .filter((col) => !(col in data));

        if (missingColumns.length > 0) {
            this.json.errors++;
            this.json.missing_columns = [
                ...this.json.missing_columns,
                ...missingColumns
            ]
        }
    }

    /**
     * Removes any columns from the data that are not allowed
     * and appends them to the JSON response.
     * @param {object} data - The data to be checked for invalid columns.
     */
    protected hasInvalidColumns = (data: object) => {
        const cols = this.entityColumns.allowed_columns;
        const invalidColumns = (Object.keys(data)).filter((key) => !cols.includes(key));

        for (const invalidColumn of invalidColumns) {
            delete (data as any)[invalidColumn];
        }

        if (invalidColumns.length > 0) {
            this.json.errors++;
            this.json.invalid_columns = invalidColumns;
        }
    }

    /**
     * Checks if there is any existing data in the database that conflicts with unique fields in the provided data.
     * This method validates unique constraints across the specified unique columns and appends existing data errors
     * to the JSON response if conflicts are found.
     *
     * @param {object} data - The data object containing values to be checked for uniqueness.
     * @param {string | null} [id=null] - The optional ID of the current entity to exclude from the check (used for updates).
     * Resolves when the check is complete, or throws an error if conflicts are found.
     */
    protected hasExistingData = async (data: object, id: string | null = null) => {
        // If no unique columns are defined, return early
        if (this.entityColumns.unique_columns.length === 0)
            return {};

        const unique = this.entityColumns.unique_columns;
        let existingData = {};

        // Build the conditions for the unique columns present in the data
        const conditions = Object.entries(data).map(
            ([key, value]) =>
                unique.includes(key) ? {[key]: value} as FindOptionsWhere<T> : null
        ).filter(condition => condition !== null);

        // Check each condition for existing records in the repository
        for (const condition of conditions) {
            // If updating, exclude the current entity by its ID
            let whereClause = id !== null ? {...condition, id: Not(id)} : condition;

            // Count the number of records that match the unique condition
            let count = await this.repository.count({
                where: whereClause
            });

            // If there's a match, add the conflicting field to the existingData object
            if (count > 0)
                existingData = {...existingData, ...condition};
        }

        // If any conflicts were found, increment the error count and append the conflicting data
        if (Object.keys(existingData).length > 0) {
            this.json.errors++;
            this.json.existing_data = existingData;
        }
    }

    /**
     * Retrieves an entity by its ID from the repository, optionally including related entities.
     * Throws a NotFoundError if the entity is not found.
     *
     * @param {string} id - The ID of the entity to retrieve.
     * @param {string[] | null} [relations=null] - An optional array of relations to load with the entity.
     * @returns the entity if found, or throws a NotFoundError if not found.
     * @throws {NotFoundError} - Thrown if the entity with the specified ID is not found.
     */
    public getEntityById = async (id: string, relations: string[] | null = null) => {
        const entity = await this.repository.findOne({
            where: {id: id} as object,
            relations: relations ?? []
        });

        if (!entity)
            throw new NotFoundError(`${this.metaData.name} not found`, {not_found: id});

        return entity;
    }
}