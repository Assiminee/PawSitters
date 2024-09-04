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

export interface JsonResponse {
    errors: number;
    existing_data: object;
    invalid_data: object;
    missing_columns: string[];
    invalid_columns: string[];
}

export interface EntityColumns {
    required_columns: string[];
    unique_columns: string[];
    updatable_columns: string[];
    allowed_columns: string[];
}

export class BaseController<T extends ObjectLiteral> {
    public json: JsonResponse;
    public metaData: EntityMetadata;
    public repository: Repository<T>;
    protected cls: EntityTarget<T>;
    protected entityColumns : EntityColumns;

    constructor(
        cls: EntityTarget<T>
    ) {
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

    protected updateProperties = (entity: BaseModel, data: object) => {
        for (const [key, value] of Object.entries(data))
            entity[key] = value;
    }

    protected checkData = (data: object) => {
        this.hasInvalidColumns(data);
        this.hasRequiredColumns(data);
    }

    protected checkDate = (data: object, key : string) => {
        if (!(key in data))
            return;

        try {
            (data as any)[key] = (new Date((data as any)[key] as string));
        } catch (err) {
            this.appendInvalidData({[key]: `Invalid date format: ${(data as any)[key]}`})
        }
    }

    appendInvalidData = (error: object) => {
        this.json.errors++;
        this.json.invalid_data = {
            ...this.json.invalid_data,
            ...error
        };
    }

    appendMissingData = (error: string) => {
        this.json.errors++;
        this.json.missing_columns.push(error);
    }

    appendExistingData = (error: object) => {
        this.json.errors++;
        this.json.existing_data = {
            ...this.json.existing_data,
            ...error
        }
    }

    protected forbiddenUpdate = (data: object) => {
        const allowed = this.entityColumns.updatable_columns;
        const forbidden = Object.keys(data).filter(key => !allowed.includes(key));

        if (forbidden.length > 0) {
            const message = 'Attempting to edit fields ' + forbidden.join(', ') + '. ' +
                'Can only edit fields ' + allowed.join(', ');
            throw new ForbiddenRequest(message, {failed: 'update'});
        }
    }

    propertyValidation = async (entity: any, message: string) => {
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

    hasRequiredColumns = (data: object) => {
        const missingColumns = (this.entityColumns.required_columns)
            .filter((col) => !(col in data));

        if (missingColumns.length > 0) {
            this.json.missing_columns = [
                ...this.json.missing_columns,
                ...missingColumns
            ]
        }
    }

    hasInvalidColumns = (data: object) => {
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

    hasExistingData = async (data: object, id: string | null = null) => {
        if (this.entityColumns.unique_columns.length === 0)
            return {};

        const unique = this.entityColumns.unique_columns;
        let existingData = {};

        const conditions = Object.entries(data).map(
            ([key, value]) =>
                unique.includes(key) ? {[key]: value} as FindOptionsWhere<T> : null
        ).filter(condition => condition !== null);

        for (const condition of conditions) {
            let whereClause = id !== null ? {...condition, id: Not(id)} : condition;

            let count = await this.repository.count({
                where: whereClause
            });

            if (count > 0)
                existingData = {...existingData, ...condition};
        }

        if (Object.keys(existingData).length > 0) {
            this.json.errors++;
            this.json.existing_data = existingData;
        }
    }

    getEntityById = async (id: string, relations: string[] | null = null) => {
        const entity = await this.repository.findOne({
            where: {id: id} as object,
            relations: relations ?? []
        });

        if (!entity)
            throw new NotFoundError(`${this.metaData.name} not found`, {not_found: id});

        return entity;
    }
}