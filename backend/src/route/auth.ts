import express from "express";
import { registerUser } from "../controller/auth.ts";
import { validate } from "../middleware/validate.ts";
import { registerSchema } from "../validation/auth.schema.ts";


const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);

export default router;