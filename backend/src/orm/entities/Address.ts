import {BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";
import {IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export enum Country {
    GH = "GHANA",
    MA = "MOROCCO"
}

@Entity()
export class Address extends BaseModel {
    @Column({
        type: "int",
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    building_num?: number;

    @Column({
        type: "varchar",
        length: 255
    })
    @IsNotEmpty()
    @IsString()
    street!: string;

    @Column({
        type: "int",
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    apartment_num?: number;

    @Column({
        type: "int",
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    floor?: number

    @Column({
        type: "varchar",
        length: 200
    })
    @IsNotEmpty()
    @IsString()
    city!: string;


    @Column({
        type: "enum",
        enum: Country
    })
    @IsNotEmpty()
    @IsEnum(Country)
    country!: string;

    @Column({
        type: "varchar",
        length: 20
    })
    @IsNotEmpty()
    @IsString()
    postal_code!: string;

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

    @BeforeInsert()
    @BeforeUpdate()
    normalize() {
        this.city = this.city.toLowerCase();
        this.street = this.street.toLowerCase();
    }
}