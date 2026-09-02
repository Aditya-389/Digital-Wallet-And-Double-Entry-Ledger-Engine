import express from "express";

import { connectDB } from "./database/db.ts"
import authRoutes  from "./route/auth.ts";
import walletRoutes from "./route/wallet.ts"

import errorHandler from "./middleware/errorHandler.ts";
import cookieParser from "cookie-parser";

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

app.use(errorHandler);  

export default app;
