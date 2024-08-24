import {Column, JoinColumn, OneToOne} from "typeorm";
import {BaseModel} from "./BaseModel";
import {User} from "./User";

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

    @Column({type: "int", nullable: true})
    buildingNum: number | null

    @Column({type: "varchar", length: 255})
    street: string

    @Column({type: "int", nullable: true})
    apartmentNum: number | null

    @Column({type: "int", nullable: true})
    floor: number | null

    @Column({type: "varchar", length: 200})
    city: string

    @Column({type: "varchar", length: 100})
    country: string

    @Column({type: "varchar", length: 20})
    postalCode: string

    @OneToOne(() => User, (user: User) => user.address)
    @JoinColumn()
    user: User | null
}