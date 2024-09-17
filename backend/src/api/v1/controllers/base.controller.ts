import {AppDataSource} from "../../../orm/data-source";
import {
    EntityMetadata,
    EntityTarget,
    ObjectLiteral,
    Repository
} from "typeorm";
import {NotFoundError} from "../errors/Errors";

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

    appendInvalidData = (error: object) => {
        this.json.errors++;
        this.json.invalid_data = {
            ...this.json.invalid_data,
            ...error
        };
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