import {AppDataSource} from "./orm/data-source";

const PORT = process.env.SERVER_PORT || 8081;

const main = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized");

        const { default: appRouter } = await import("./api/v1/routes/app.router");

        appRouter.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
}

main();

