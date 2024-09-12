import {PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity} from "typeorm";

export class BaseModel extends BaseEntity {
    [key : string] : any;

    @PrimaryGeneratedColumn("uuid")
    id!: string

    @CreateDateColumn({
        name: 'created_at',
        type: "timestamp"
    })
    createdAt!: Date

    @UpdateDateColumn({
        name: 'updated_at',
        type: "timestamp"
    })
    updatedAt!: Date

    removeCreatedUpdatedDates() {
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