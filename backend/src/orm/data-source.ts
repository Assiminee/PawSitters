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

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "PawSitters",
    entities: [
        User, UserImage, Role,
        Review, Certification,
        Address, Booking, Breed,
        Payment, Pet, PetImage, Species
    ],
    synchronize: true,
    logging: true,
});

