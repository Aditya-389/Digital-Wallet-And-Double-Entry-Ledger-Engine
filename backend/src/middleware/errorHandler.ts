import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.ts"
import { errorResponse } from "../utils/ApiResponse.ts";


const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    console.log("Error : ", err.message);

    return res.status(statusCode).json(
        errorResponse(
            err.message,
            err.data
        )
    );
}

export default errorHandler;