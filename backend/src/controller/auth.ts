import { Request, Response } from "express";
import { registerUserService } from "../service/auth.ts";
import { successResponse } from "../utils/ApiResponse.ts";


export const registerUser = async(req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // No validation needed cause --> Zod handles it

    const user = await registerUserService(name, email, password);
    
    return res.status(201).json(
        successResponse(
            "user created successfully",
            user
        )
    );
}