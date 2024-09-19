import {AppDataSource} from "./orm/data-source";
import {createUsers} from "./init_users";

const PORT = process.env.SERVER_PORT || 8081; // Set the server port from environment variable or default to 8081

// Main function to initialize and start the application
const main = async () => {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();
        console.log("Database initialized");

        // Dynamically import the data initialization module
        const { init } = await import("./data_initialization");

        // Call the initialization function to set up initial data
        await init();

        // Dynamically import the application router
        const { default: appRouter } = await import("./api/v1/routes/app.router");

        // Start the server and listen on the specified port
        appRouter.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
            // After starting the server, create users
            createUsers();
        });
    } catch (err) {
        console.error(err);
    }
}

// Execute the main function
main();

