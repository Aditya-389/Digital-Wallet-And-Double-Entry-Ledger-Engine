import { Request, Response } from "express";
import { loginUserService, logoutUserService, registerUserService, rotateRefreshTokenService } from "../service/auth.ts";
import { successResponse } from "../utils/ApiResponse.ts";
import { ApiError } from "../utils/ApiError.ts";



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

export const rotateRefreshToken = async(req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;

    if(!oldRefreshToken) {
        throw new ApiError(
            401,
            "Refresh token not found"
        )
    }

    const { newAccessToken, newRefreshToken } = await rotateRefreshTokenService(oldRefreshToken);

    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    })

    return res.status(200).json(
        successResponse(
            "Refresh Token rotation successfull"
        )
    );
} 


export const logoutUser = async(req: Request, res: Response) => {
    const currRefreshToken = req.cookies.refreshToken;

    if(!currRefreshToken) {
        throw new ApiError(
            401,
            "Refresh token not found"
        )
    }

    await logoutUserService(currRefreshToken);

    // clear cookies
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    return res.status(200).json(
        successResponse("User logged out successfully")
    );
}