import express from "express";

import { connectDB } from "./database/db.ts"

import errorHandler from "./middleware/errorHandler.ts";

const app = express();

connectDB();

app.use(express.json());

app.use(errorHandler);  

export default app;
