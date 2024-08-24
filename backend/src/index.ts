import "reflect-metadata"
import {AppDataSource} from "./orm/data-source";
import {User} from "./orm/entities/User";

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        const userRepository = AppDataSource.getRepository(User);
        const user = new User();
        user.fname = "Yasmine";
        user.lname = "Znatni";
        user.email = "znatni.yasmine@gmail.com";
        user.phone = "+21248288553";
        user.password = "testPWD@01";
        user.gender = "Female";
        user.birthday = new Date("1997-10-18");
        userRepository.save(user)
            .then(resp => console.log(resp))
            .catch(err => console.error(err));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
