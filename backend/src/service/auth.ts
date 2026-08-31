import { prisma } from "../database/db.ts";
import { ApiError } from "../utils/ApiError.ts";
import { comparePassword, hashPassword, hashRefreshToken } from "../utils/argon.ts";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.ts";


export const registerUserService = async(name: string, email: string, password: string) => {
    
    // user already Exists? 
    const alreadyExistsUser = await prisma.user.findUnique({
        where: {email}
    });

    if(alreadyExistsUser) {
        throw new ApiError(
            409,
            "user already Exists"
        ) 
    }

    // hash passsword
    const hashedPassword = await hashPassword(password);

    // create user
    const newUser = await prisma.user.create({
        data : {
            name: name,
            email: email,
            passwordHash: hashedPassword
        },
        select : {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true
        }
    });

    return newUser;
}

export const loginUserService = async(email: string, passsword: string) => {

    // find user
    const user = await prisma.user.findUnique({
        where: {email}
    });

    if(!user) {
        throw new ApiError(
            404,
            "Please enter correct email or password"
        )
    }

    if (!user.isActive) {
        throw new ApiError(403, "Account is inactive");
    }

    // match password
    const isPasswordMatched = await comparePassword(passsword, user.passwordHash);

    if(!isPasswordMatched) {
        throw new ApiError(
            404,
            "Please enter correct email or password"
        )
    }

    // update last login field of user
    await prisma.user.update({
        where: {email},
        data : {
            lastLoginAt: new Date()
        }
    });

    // generate access and refresh token
    const accessToken = generateAccessToken(user.id, user.role);
    const { token: refreshToken, jti} = generateRefreshToken(user.id, user.role);

    // hash refresh token
    const refreshTokenHash = await hashRefreshToken(refreshToken);
 
    // store refresh token in DB
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            jti
        }
    })

    return {accessToken, refreshToken};
} 
