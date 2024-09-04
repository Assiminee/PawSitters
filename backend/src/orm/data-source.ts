import {DataSource} from 'typeorm';
import {UserImage} from "./entities/UserImage";
import {User} from "./entities/User";
import {Role} from "./entities/Role";
import {Review} from "./entities/Review";
import {Certification} from "./entities/Certification";
import {Address} from "./entities/Address";
import {Booking} from "./entities/Booking";
import {Breed} from "./entities/Breed";
import {Payment} from "./entities/Payment";
import {Pet} from "./entities/Pet";
import {PetImage} from "./entities/PetImage";
import {Species} from "./entities/Species";
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        User, UserImage, Role,
        Review, Certification,
        Address, Booking, Breed,
        Payment, Pet, PetImage, Species
    ],
    synchronize: false,
    logging: true
});

