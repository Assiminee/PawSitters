import express = require("express");
import userRouter from "./user.router";
import roleRouter from "./role.router";
import speciesRouter from "./species.router";
import cors from 'cors';
import fs from "fs";
import {uploads} from "./helperFunctions";

// Create an Express application
const app = express();

// Create the uploads directory if it does not exist
fs.mkdir(uploads, { recursive: true }, (err) => {
    if (err)
        console.error('Error creating uploads directory: ', err);
});

// Middleware to enable CORS (Cross-Origin Resource Sharing)
// This allows requests from other domains to access the server's resources
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'uploads' directory
// Accessible under the '/public/uploads' URL path
app.use('/public/uploads', express.static(uploads));

// Routes for different API endpoints
// Users route
app.use('/api/v1/users', userRouter);
// Roles route
app.use('/api/v1/roles', roleRouter);
// Species route
app.use('/api/v1/species', speciesRouter);

// Middleware to handle 404 errors
// Sends a 404 status code and a 'Route not found' message
app.use((req, res, next) =>
    res.status(404).send('Route not found')
);

export default app;
