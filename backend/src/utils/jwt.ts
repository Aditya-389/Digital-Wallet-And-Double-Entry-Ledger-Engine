import config from '../config/env.ts'; 
import { Role } from '../generated/prisma/enums.ts';

import jwt from 'jsonwebtoken';

interface AccessTokenPlayload {
    id: number,
    role: Role
}

interface RefreshTokenPayload {
    id: number,
    role: Role,
    jti: string
}


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
    const jti = crypto.randomUUID();

    const payload = {
        id: userId,
        role,
        jti  // Unique key to identify refresh token
    };

    const token = jwt.sign(
        payload,
        config.JWT_REFRESH_SECRET!,
        {
            expiresIn: "7d"
        }
    )

    return {token, jti}
}

export const verifyAccessToken = (accessToken: string) => {
    return jwt.verify(
        accessToken,
        config.JWT_ACCESS_SECRET!
    ) as AccessTokenPlayload;
};

export const verifyRefreshToken = (refreshToken: string) : RefreshTokenPayload => {
    return jwt.verify(
        refreshToken,
        config.JWT_REFRESH_SECRET!
    ) as RefreshTokenPayload
};



