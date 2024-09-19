import {PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity} from "typeorm";

/**
 * BaseModel class provides common fields and methods for all entities.
 *
 * - Extends `BaseEntity` from TypeORM for built-in entity functionality.
 * - Defines `id`, `createdAt`, and `updatedAt` fields.
 * - Provides a method to remove created and updated timestamps from the entity object.
 */
export class BaseModel extends BaseEntity {
    [key : string] : any;

    /**
     * Unique identifier for the entity, generated as a UUID.
     *
     * @type {string}
     */
    @PrimaryGeneratedColumn("uuid")
    id!: string

    /**
     * Timestamp indicating when the entity was created.
     *
     * @type {Date}
     */
    @CreateDateColumn({
        name: 'created_at',
        type: "timestamp"
    })
    createdAt!: Date

    /**
     * Timestamp indicating the last time the entity was updated.
     *
     * @type {Date}
     */
    @UpdateDateColumn({
        name: 'updated_at',
        type: "timestamp"
    })
    updatedAt!: Date

    /**
     * Removes `createdAt` and `updatedAt` fields from the entity object.
     *
     * This method creates a shallow copy of the entity object and deletes
     * the `createdAt` and `updatedAt` properties if they exist. Also removes
     * `user` property if present. This method is useful for returning entities
     * without timestamps or sensitive data.
     *
     * @returns {object} - The entity object without `createdAt`, `updatedAt`, and `user` properties.
     */
    public removeCreatedUpdatedDates() : object {
        const obj = {...this};
        // @ts-ignore
        delete obj.createdAt;
        // @ts-ignore
        delete obj.updatedAt;
        if ('user' in obj)
            // @ts-ignore
            delete obj.user;
        return obj;
    }
}