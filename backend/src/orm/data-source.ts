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

// Resolve the path to the .env file
const envPath = path.resolve(__dirname, '../../.env');

// Load environment variables from the .env file
config({ path: envPath });

// Create a new TypeORM DataSource instance with the database configuration
export const AppDataSource = new DataSource({
    type: "mysql", // Specify the database type as MySQL
    host: process.env.DB_HOST, // Database host from environment variables
    port: parseInt(process.env.DB_PORT || '3306', 10), // Database port from environment variables, default to 3306
    username: process.env.DB_USERNAME, // Database username from environment variables
    password: process.env.DB_PASSWORD, // Database password from environment variables
    database: process.env.DB_NAME, // Database name from environment variables
    entities: [ // Array of entity classes to be managed by TypeORM
        User, Role, Review,
        Certification, Address,
        Booking, Breed, Payment,
        Pet, Species
    ],
    synchronize: true, // Do not automatically synchronize the database schema
    logging: false // Disable SQL query logging
});

