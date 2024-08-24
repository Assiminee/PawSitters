import {PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";

export class BaseModel {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date
}