import {AppDataSource} from "./src/orm/data-source";
import "reflect-metadata"
import express = require("express");

const app = express();
const PORT = 8080;

const main = async () => {
    try {
        const connection = await AppDataSource.initialize();

        if (!connection.isInitialized)
            throw new Error();

        app.use(express.json());

        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    } catch (error) {
        throw error;
    }
}

main()
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Failed to connect to database\n", err));
