import express from 'express';
import { config } from "dotenv";
import {UserRouter} from "./Routes";


config();

const app = express();
const { PORT } = process.env;


app.use(express.json());
app.use("api/users", UserRouter);


app.listen(PORT || 3000, () => {
    console.log(`Server is running on ${PORT || 5000}`);
});

export default app;
