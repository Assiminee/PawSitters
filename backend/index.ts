import {AppDataSource} from "./src/orm/data-source";

const main = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized");
    } catch (err) {
        console.error(err);
    }
}

main();

