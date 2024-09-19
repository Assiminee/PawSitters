import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {IsDate, IsNotEmpty, IsString} from "class-validator";

/**
 * Entity representing a certification held by a user.
 *
 * Extends `BaseModel` to inherit common fields and methods.
 *
 * @extends BaseModel
 * @entity
 */
@Entity()
export class Certification extends BaseModel {

    /**
     * The title of the certification.
     *
     * Must be a non-empty string with a maximum length of 255 characters.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    title!: string;

    /**
     * The date when the certification was issued.
     *
     * Must be a valid date and cannot be empty.
     *
     * @type {Date}
     */
    @Column({ type: Date })
    @IsNotEmpty()
    @IsDate()
    issue_date!: Date;

    /**
     * The organization that issued the certification.
     *
     * Must be a non-empty string with a maximum length of 255 characters.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    organization!: string;

    /**
     * The user who holds the certification.
     *
     * References the `User` entity with a many-to-one relationship.
     *
     * @type {User}
     */
    @ManyToOne(
        () => User,
        (user: User) => user.certifications
    )
    @JoinColumn({ name: "user_id" })
    @IsNotEmpty()
    user!: User;
}