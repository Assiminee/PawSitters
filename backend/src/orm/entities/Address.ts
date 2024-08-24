import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";

@Entity()
export class Address extends BaseModel {
    constructor() {
        super();
        this.buildingNum = null;
        this.street = '';
        this.apartmentNum = null;
        this.floor = null;
        this.city = '';
        this.country = '';
        this.postalCode = '';
        this.user = null
    }

    @Column({
        name: "building_number",
        type: "int",
        nullable: true
    })
    buildingNum: number | null

    @Column({
        type: "varchar",
        length: 255
    })
    street: string

    @Column({
        name: "apartment_number",
        type: "int",
        nullable: true
    })
    apartmentNum: number | null

    @Column({
        type: "int",
        nullable: true
    })
    floor: number | null

    @Column({
        type: "varchar",
        length: 200
    })
    city: string

    @Column({
        type: "varchar",
        length: 100
    })
    country: string

    @Column({
        name: "postal_code",
        type: "varchar",
        length: 20
    })
    postalCode: string

    @OneToOne(
        () => User,
        (user: User) => user.address
    )
    @JoinColumn({
        name: "user_id"
    })
    user: User | null
}