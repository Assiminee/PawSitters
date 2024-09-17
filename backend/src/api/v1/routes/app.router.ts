import express = require("express");
import userRouter from "./user.router";
import roleRouter from "./role.router";
import speciesRouter from "./species.router";
import cors from 'cors';
import fs from "fs";
import {uploads} from "./helperFunctions";

const app = express();

fs.mkdir(uploads, { recursive: true }, (err) => {
    if (err)
        console.error('Error creating uploads directory: ', err);
});
console.log(uploads);

app.use(cors());
app.use(express.json());
app.use('/public/uploads', express.static(uploads));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/species', speciesRouter);
app.use((req, res, next) =>
    res.status(404).send('Route not found')
);

export default app;
