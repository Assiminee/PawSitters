import {AppDataSource} from "./src/orm/data-source";
import {Breed} from "./src/orm/entities/Breed";
import {Role} from "./src/orm/entities/Role";
import {Species} from "./src/orm/entities/Species";
import {createUsers} from "./src/init_users";

const PORT = process.env.SERVER_PORT || 8080;

const main = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized");

        const { init } = await import("./src/data_initialization");

        await init();

        const { default: appRouter } = await import("./src/api/v1/routes/app.router");

        appRouter.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
            createUsers();
        });
    } catch (err) {
        console.error(err);
    }
}

main();

