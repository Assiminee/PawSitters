import {DataSource} from 'typeorm';
import {User} from "./entities/User";
import {Role} from "./entities/Role";
import {Review} from "./entities/Review";
import {Certification} from "./entities/Certification";
import {Address} from "./entities/Address";
import {Booking} from "./entities/Booking";
import {Breed} from "./entities/Breed";
import {Payment} from "./entities/Payment";
import {Pet} from "./entities/Pet";
import {Species} from "./entities/Species";
import { config } from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');

config({ path: envPath });

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        User, Role, Review,
        Certification, Address,
        Booking, Breed, Payment,
        Pet, Species
    ],
    synchronize: false,
    logging: false
});

