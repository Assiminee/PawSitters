import "reflect-metadata"
import {AppDataSource} from "./orm/data-source";
import {BaseRepository} from "./orm/repositories/Base.repository";
import {User} from "./orm/entities/User";

AppDataSource.initialize()
    .then(() => console.log("Data Source has been initialized!"))
    // .then(() => {
        // const userRepository = new BaseRepository(User);
        // userRepository.getEntities({})
        //     .then(users => {
        //         console.log(users);
        //     })
        //     .catch(err => console.log(err));
        // const resp = userRepository.saveEntity({
        //     fname: "Khadija",
        //     lname: "Naji",
        //     email: "naji.khadija@gmail.com",
        //     birthday: new Date("1954-11-11"),
        //     gender: "Female",
        //     password: "TestPWD@0011",
        //     // test: "test"
        // })
        //     .then((resp) => {
        //         console.log(resp);
        //     })
        //     .catch(err => console.error(err));
        // userRepository.countEntities({test: "test"})
        //     .then(count => {
        //         console.log(count);
        //     })
        //     .catch(err => console.error(err));
    // })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
