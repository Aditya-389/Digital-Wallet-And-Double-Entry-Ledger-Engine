import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.ts";


export const idempotencyHandler = async(
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    
    // This key should be enterd in postman paylaad when makking request ??
    const idempotencyKey = req.get("Idempotency-Key");

    if (!idempotencyKey) {
        return next(
            new ApiError(
                400,
                "Idempotency-Key header is required"
            )
        );
    }

    if (idempotencyKey.length > 255) {
        return next(
            new ApiError(
                400,
                "Idempotency-Key is too long"
            )
        );
    }

    try {
        req.idempotencyKey = idempotencyKey;
        return next();

    }catch(error) {
        return next(error);
    }
}