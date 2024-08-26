import {PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity} from "typeorm";

export class BaseModel extends BaseEntity {
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
}