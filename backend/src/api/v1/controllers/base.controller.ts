import {AppDataSource} from "../../../orm/data-source";
import {
    DeepPartial,
    EntityMetadata,
    EntityTarget,
    FindOptionsWhere,
    Not,
    ObjectLiteral,
    Repository
} from "typeorm";
import {AppError, NotFoundError, InvalidDataError, ForbiddenRequest} from "../errors/Errors";
import {validate} from "class-validator";
import {BaseModel} from "../../../orm/entities/BaseModel";

export interface JsonResponse {
    errors: number;
    existing_data: object;
    invalid_data: object;
    missing_columns: string[];
    invalid_columns: string[];
}

export class BaseController<T extends ObjectLiteral> {
    public json: JsonResponse;
    public metaData: EntityMetadata;
    public repository: Repository<T>;
    protected cls: EntityTarget<T>;
    protected uniqueColumns: string[];
    protected allowed : string[];

    constructor(
        cls: EntityTarget<T>
    ) {
        this.cls = cls;
        this.repository = AppDataSource.getRepository(this.cls);
        this.metaData = AppDataSource.getMetadata(this.cls);
        this.uniqueColumns = [];
        this.allowed = []
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
        const forbidden = Object.keys(data).filter(key => !this.allowed.includes(key));

        if (forbidden.length > 0) {
            const message = 'Attempting to edit fields ' + forbidden.join(', ') + '. ' +
                'Can only edit fields ' + this.allowed.join(', ');
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

    getNonNullableColumns = (): string[] => {
        const columns = this.metaData.columns;
        return columns
            .filter(column =>
                !column.isNullable &&
                !column.isPrimary &&
                !column.isCreateDate &&
                !column.isUpdateDate &&
                column.default === undefined
            )
            .map(column => column.propertyName);
    }

    getAllowedColumns = (): string[] => {
        const columns = this.metaData.columns;
        return columns
            .filter((col) =>
                !col.isPrimary &&
                !col.isCreateDate &&
                !col.isUpdateDate
            ).map(col => col.propertyName);
    }

    hasRequiredColumns = (data: object) => {
        const missingColumns = (this.getNonNullableColumns())
            .filter((col) => !(col in data));

        if (missingColumns.length > 0) {
            this.json.missing_columns = [
                ...this.json.missing_columns,
                ...missingColumns
            ]
        }
    }

    hasInvalidColumns = (data: object) => {
        const cols = this.getAllowedColumns();
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
        if (this.uniqueColumns.length === 0)
            return {};

        let existingData = {};

        const conditions = Object.entries(data).map(
            ([key, value]) =>
                this.uniqueColumns.includes(key) ? {[key]: value} as FindOptionsWhere<T> : null
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

    // getForeignKeys = (): string[] => {
    //     return this.metaData.foreignKeys
    //         .map(key =>
    //             key.columns.map(
    //                 column => column.propertyName
    //             )
    //         ).flat();
    // }

    // hasInvalidRelations = (relations : string[]) => {
    //     const allRelations = this.metaData.relations.map(relation =>
    //         relation.propertyName
    //     );
    //
    //     const invalidRelations = relations.filter(relation =>
    //         !allRelations.includes(relation)
    //     );
    //
    //     if (invalidRelations.length > 0)
    //         throw new InvalidDataError(`Invalid Relations: ${invalidRelations.join(', ')}`);
    // }

    // hasInvalidRelations = (relations : RelationsArray) => {
    //     const rel = [];
    //
    //     for (const relation of relations) {
    //         if (this.cls === relation.root)
    //             continue;
    //
    //         const entity = relation.root;
    //         const entityRelations = relation.relations;
    //
    //         if (!AppDataSource.hasMetadata(entity))
    //             throw new InvalidDataError(`Invalid Entity: ${entity}`);
    //
    //         const validRelations = AppDataSource.getMetadata(entity)
    //             .relations.map(rel => rel.propertyName);
    //         const invalidRelations = entityRelations.filter(entityRelation =>
    //             !validRelations.includes(entityRelation)
    //         )
    //
    //         if (invalidRelations.length > 0)
    //             throw new InvalidDataError(`Invalid relations for entity ${entity}: ${invalidRelations.join(', ')}`);
    //
    //     }
    //
    // }

    // hasOwnedRelations = (relations: string[]) => {
    //     const ownderRelations = this.metaData.relations.filter(relation =>
    //         relation.isOwning
    //     ).map(relation => relation.propertyName);
    //
    //     return relations.filter(relation => ownderRelations.includes(relation));
    // }

    getEntityById = async (id: string, relations: string[] | null = null) => {
        const entity = await this.repository.findOne({
            where: {id: id} as object,
            relations: relations ?? []
        });

        if (!entity)
            throw new NotFoundError(`${this.metaData.name} not found`, {not_found: id});

        return entity;
    }

    getEntities = async (relations: string[] | null = null) => {
        return await this.repository.find({
            relations: relations as string[]
        });
    };

    saveEntity = async (data: object | null = null) => {
        if (!data || Object.keys(data).length === 0)
            throw new InvalidDataError("Cannot save entity (missing data.json)", {missing: 'all'});

        this.hasInvalidColumns(data);
        this.hasRequiredColumns(data);
        await this.hasExistingData(data);

        const entityData: DeepPartial<T> = data as DeepPartial<T>;
        const entity = this.repository.create(entityData);

        const validEntity = await validate(entity);
        console.log(validEntity);

        return await this.repository.save(entity);
    }

    updateEntity = async (id: string, data: object | null = null) => {
        const exists = await this.repository.existsBy({id: id} as object);

        if (!exists)
            throw new NotFoundError(`${this.metaData.name} doesn't exist`, {notFound: id});

        if (!data || Object.keys(data).length === 0)
            throw new InvalidDataError('Cannot update entity (missing data.json)', {missing: 'all'});

        this.hasInvalidColumns(data);
        await this.hasExistingData(data);

        await this.repository.update(id, data);
        const updatedEntity = await this.repository.findOneBy({id: id} as object);

        if (!updatedEntity)
            throw new AppError(`Update failed`, 500, {failed: 'update', reason: 'Unknown'});

        return updatedEntity;
    }

    countEntities = async (data: object) => {
        this.hasInvalidColumns(data);
        if (Object.keys(data as object).length === 0)
            return await this.repository.count();

        return await this.repository.countBy(data as object);
    }

    deleteEntity = async (id: string) => {
        const entity = await this.repository.findOne(
            {where: {id: id} as object}
        );

        if (!entity)
            throw new NotFoundError(`${this.metaData.name} not found`, {notFound: id});

        const delRes = await this.repository.delete({id: id} as object);
        if (delRes.affected === 0)
            throw new AppError(`Delete failed`, 500, {failed: 'delete', reason: 'Unknown'});

        return;
    }
}