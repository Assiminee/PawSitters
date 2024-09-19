import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import {User} from "./User";
import {IsEnum, IsNotEmpty} from "class-validator";

/**
 * Enum representing different roles in the system.
 */
export enum Roles {
    A = "ADMIN",  // Admin role with full permissions
    O = "OWNER",  // Owner role with ownership privileges
    S = "SITTER"  // Sitter role with pet sitting permissions
}

/**
 * Entity representing a role.
 *
 * This entity defines various roles within the system and their associated users.
 * Each role is unique and can be assigned to multiple users.
 *
 * @extends BaseEntity
 * @entity
 */
@Entity()
@Unique(['role'])
export class Role extends BaseEntity {

    /**
     * The unique identifier for the role.
     *
     * Automatically generated UUID for each role.
     *
     * @type {string}
     */
    @PrimaryGeneratedColumn("uuid")
    id!: string

    /**
     * The title of the role.
     *
     * Must be a valid enum value from the `Roles` enum and cannot be empty.
     *
     * @type {string}
     */
    @Column({
        type: "enum",
        enum: Roles
    })
    @IsNotEmpty({message: "Role title cannot be empty"})
    @IsEnum(Roles)
    role!: string;

    /**
     * The users associated with this role.
     *
     * One-to-many relationship with the `User` entity.
     *
     * @type {User[]}
     */
    @OneToMany(
        () => User,
        (user: User) => user.role
    )
    users!: User[];
}