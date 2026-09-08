import express from "express";
import { authHandler } from "../middleware/authHandler.ts";
import { validate } from "../middleware/validate.ts";
import { transferSchema } from "../validation/transfer.schema.ts";
import { idempotencyHandler } from "../middleware/idempotencyHandler.ts";
import { createTransfer } from "../controller/transfer.ts";


const router = express.Router();

router.post(
    '/create', 
    authHandler, 
    validate(transferSchema),
    idempotencyHandler,
    createTransfer
);

export default router;