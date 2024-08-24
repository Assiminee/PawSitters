import { DataSource } from 'typeorm';
import {UserImage} from "./entities/UserImage";
import {User} from "./entities/User";
import {Role} from "./entities/Role";
import {Review} from "./entities/Review";
import {Certification} from "./entities/Certification";
import {Address} from "./entities/Address";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "PawSitters",
    entities: [User, UserImage, Role, Review, Certification, Address],
    synchronize: true,
    logging: true,
});

