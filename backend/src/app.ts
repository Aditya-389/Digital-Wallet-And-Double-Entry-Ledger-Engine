import express from "express";

import { connectDB } from "./config/db.ts"

const app = express();

connectDB();

export default app;
