import express from "express";
import { authHandler } from "../middleware/authHandler.ts";
import { createPayment } from "../controller/payment.ts";


const router = express.Router();

router.post('/mock', authHandler, createPayment);

export default router;