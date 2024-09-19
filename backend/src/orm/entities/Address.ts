import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

/**
 * Enum representing possible countries.
 *
 * @enum {string}
 */
export enum Country {
    GH = "GHANA",
    MA = "MOROCCO"
}


/**
 * Entity representing an address.
 *
 * Extends `BaseModel` to inherit common fields and methods.
 *
 * @extends BaseModel
 */
@Entity()
export class Address extends BaseModel {
    /**
     * Building number of the address.
     *
     * @type {number}
     * @optional
     */
    @Column({
        type: "int",
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    building_num?: number;

    /**
     * Street name of the address.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    street!: string;

    /**
     * Apartment number of the address.
     *
     * @type {number}
     * @optional
     */
    @Column({
        type: "int",
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    apartment_num?: number;

    /**
     * Floor number of the address.
     *
     * @type {number}
     * @optional
     */
    @Column({
        type: "int",
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    floor?: number

    /**
     * City of the address.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 200
    })
    @IsNotEmpty()
    @IsString()
    city!: string;

    /**
     * Country of the address, represented by the `Country` enum.
     *
     * @type {string}
     */
    @Column({
        type: "enum",
        enum: Country
    })
    @IsNotEmpty()
    @IsEnum(Country)
    country!: string;

    /**
     * Postal code of the address.
     *
     * @type {string}
     */
    @Column({
        type: "varchar",
        length: 20
    })
    @IsNotEmpty()
    @IsString()
    postal_code!: string;

    /**
     * One-to-one relationship with the `User` entity.
     *
     * Specifies that each `Address` must be associated with exactly one `User`.
     *
     * @type {User}
     */
    @OneToOne(
        () => User,
        (user: User) => user.address,
        {nullable : false}
    )
    @JoinColumn({
        name: "user_id"
    })
    @IsNotEmpty()
    user!: User;

    /**
     * Normalize address fields before inserting or updating the entity.
     *
     * Converts the `city` and `street` fields to lowercase to ensure consistent formatting.
     */
    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.city = this.city.toLowerCase();
        this.street = this.street.toLowerCase();
    }
}