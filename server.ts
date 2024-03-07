import express from 'express';
import { config } from "dotenv";
import "express-async-errors";
import {AccountRouter, UserRouter} from "./Routes";
import errorHandler from './middlewares/error.middleware';


config();

const app = express();
const { PORT } = process.env;


app.use(express.json());
app.use("/api/users", UserRouter);
app.use("/api/accounts", AccountRouter);

// always leave this as the last in order to catch all errors that may occur
app.use(errorHandler);


app.listen(PORT || 3000, () => {
    console.log(`Server is running on ${PORT || 3000}`);
});

export default app;
