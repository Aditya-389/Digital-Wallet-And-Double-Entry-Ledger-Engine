import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/ApiResponse.ts';
import { verifyAccessToken } from '../utils/jwt.ts';
import { ApiError } from '../utils/ApiError.ts';


export const authHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.accessToken;
    
    if(!token) {
        return res.status(401).json(
            errorResponse(
                "Invalid token, login again"
            )
        );
    }

    try{
        const decode = verifyAccessToken(token);
        req.userId = decode.id;
        req.role = decode.role;
        
        return next();

    }catch(err) {
        console.log("Error in Auth Middleware: ", err);
        return next(new ApiError(401, "Invalid or Expired Token"));
    }
}