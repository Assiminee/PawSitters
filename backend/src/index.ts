import {AppDataSource} from "./orm/data-source";
import {createUsers} from "./init_users";

const PORT = process.env.SERVER_PORT || 8081;

const main = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized");

        const { init } = await import("./data_initialization");

        await init();

        const { default: appRouter } = await import("./api/v1/routes/app.router");

        appRouter.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
            // createUsers();
        });
    } catch (err) {
        console.error(err);
    }
}

main();

