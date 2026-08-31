import config from '../config/env.ts'; 
import { Role } from '../generated/prisma/enums.ts';

import jwt from 'jsonwebtoken';


export const generateAccessToken = (userId: number, role: Role) => {
    const payload = {
        id: userId,
        role,
    };

    return jwt.sign(
        payload,
        config.JWT_ACCESS_SECRET!,
        {
            expiresIn: "15m"
        }
    )
}

export const generateRefreshToken = (userId: number, role: Role) => {
    const payload = {
        id: userId,
        role,
        jti: crypto.randomUUID()   // Unique key to identify refresh token
    };

    return jwt.sign(
        payload,
        config.JWT_REFRESH_SECRET!,
        {
            expiresIn: "7d"
        }
    )
}

export const verifyAccessToken = (accessToken: string) => {
    return jwt.verify(
        accessToken,
        config.JWT_ACCESS_SECRET!
    );
};

export const verifyRefreshToken = (refreshToken: string) => {
    return jwt.verify(
        refreshToken,
        config.JWT_REFRESH_SECRET!
    );
};



