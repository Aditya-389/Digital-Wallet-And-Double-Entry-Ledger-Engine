import express from "express";
import { loginUser, registerUser, rotateRefreshToken } from "../controller/auth.ts";
import { validate } from "../middleware/validate.ts";
import { loginSchema, registerSchema } from "../validation/auth.schema.ts";


const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', rotateRefreshToken);

export default router;