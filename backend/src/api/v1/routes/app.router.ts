import express = require("express");
import userRouter from "./user.router";
import roleRouter from "./role.router";
import speciesRouter from "./species.router";

const app = express();

app.use(express.json());
app.use('/api/v1/users', userRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/species', speciesRouter);
app.use((req, res, next) =>
    res.status(404).send('Route not found')
);

export default app;
