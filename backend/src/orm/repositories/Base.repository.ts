import {AppDataSource} from "../data-source";
import {DeepPartial, EntityMetadata, EntityTarget, ObjectLiteral, Repository} from "typeorm";

export class BaseRepository<T extends ObjectLiteral> {
    constructor(cls: EntityTarget<T>) {
        this.cls = cls;
        this.repository = AppDataSource.getRepository(cls);
        this.metaData = AppDataSource.getMetadata(this.cls);
    }

    protected repository: Repository<T>;
    protected cls: EntityTarget<T>;
    protected metaData: EntityMetadata;

    getNonNullableColumns = (): string[] => {
        const columns = this.metaData.columns;
        return columns
            .filter(column =>
                !column.isNullable &&
                !column.isPrimary &&
                !column.isCreateDate &&
                !column.isUpdateDate)
            .map(column => column.propertyName);
    }

    hasRequiredColumns = (data: object): string[] => {
        const requiredColumns: string[] = this.getNonNullableColumns();
        const missingColumns: string[] = [];

        for (const col of requiredColumns) {
            if (!(col in data))
                missingColumns.push(col);
        }

        return missingColumns;
    }

    hasInvalidColumns = (data: object): object => {
        const invalidColumns: string[] = [];
        const columns = this.metaData.propertiesMap;

        for (const key of Object.keys(data)) {
            if (!(key in columns))
                invalidColumns.push(key);
        }

        return invalidColumns;
    }

    getEntities = async (data: object) => {
        return new Promise((resolve, reject) => {
            const invalidColumns = this.hasInvalidColumns(data);

            if (Object.keys(invalidColumns).length > 0)
                reject({"Invalid Columns": invalidColumns});
            resolve(data);
        })
            .then((data) => {
                if (Object.keys(data as object).length === 0)
                    return this.repository.find();
                return this.repository.findBy(data as object);
            })
            .catch(err => err);
    };

    saveEntity = async (data: object): Promise<T | Error> => {
        return new Promise((resolve, reject) => {
            const invalid = this.hasInvalidColumns(data);
            const missing = this.hasRequiredColumns(data);

            if (Object.keys(data).length === 0)
                reject("Cannot save entity (missing data.json)");

            if (Object.keys(invalid).length > 0 || Object.keys(missing).length > 0)
                reject({"Invalid Columns": invalid, "Missing Columns": missing});

            resolve(data);
        })
            .then((data) => {
                const entityData: DeepPartial<T> = data as DeepPartial<T>;
                const entity = this.repository.create(entityData);
                return this.repository.save(entity);
            })
            .catch((err) => {
                return err;
            });
    }

    updateEntity = async (entity : any) => {
        return new Promise((resolve, reject) => {
            if (typeof entity !== this.cls)
                reject({"Invalid Entity": typeof entity});
            resolve(entity);
        })
            .then((entity) => {
                return this.repository.save(entity as DeepPartial<T>);
            })
            .catch((err) => {
                return err;
            });
    }

    countEntities = async (data : object) => {
        return new Promise((resolve, reject) => {
            const invalidColumns = this.hasInvalidColumns(data);

            if (Object.keys(invalidColumns).length > 0)
                reject({"Invalid Columns": invalidColumns});
            resolve(data);
        })
            .then((data) => {
                if (Object.keys(data as object).length === 0)
                    return this.repository.count();
                return this.repository.countBy(data as object);
            })
            .catch(err => err);
    }

}