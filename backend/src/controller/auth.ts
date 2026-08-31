import { Request, Response } from "express";
import { loginUserService, registerUserService } from "../service/auth.ts";
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

export const loginUser = async(req: Request, res: Response) => {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await loginUserService(email, password);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    })

    return res.status(200).json(
        successResponse(
            "user loggedin successfully"
        )
    );
}