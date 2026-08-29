import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { errorResponse } from "../utils/ApiResponse.ts";


export const validate = (schema: z.ZodType) => {
    return (
        req: Request, 
        res: Response, 
        next: NextFunction
    ) => {
        const result = schema.safeParse(req.body);

        if(!result) {
            return res.status(400).json(
                errorResponse(
                    "Validation Failed",
                )
            )
        }

        req.body = result.data;

        return next();
    } 
}