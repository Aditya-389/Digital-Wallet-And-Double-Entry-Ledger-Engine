import { prisma } from "../database/db.ts";
import { ApiError } from "../utils/ApiError.ts";
import { comparePassword, compareRefreshToken, hashPassword, hashRefreshToken } from "../utils/argon.ts";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.ts";


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

export const rotateRefreshTokenService = async(oldRefreshToken: string) => {
    const payload = verifyRefreshToken(oldRefreshToken);
    const { id: userId, role, jti } = payload;

    if(!jti) {
        throw new ApiError(
            401,
            "Unauthorized. Please loggin again"
        )
    }

    // validating refresh token using stored jti
    const storedRefreshToken = await prisma.refreshToken.findUnique({
        where: {jti},
        select: {
            tokenHash: true,
            revokedAt: true,
            expiresAt: true
        }
    });

    if(!storedRefreshToken?.tokenHash) {
        throw new ApiError(
            401,
            "Unauthorized. Please loggin again"
        )
    }

    if(storedRefreshToken.revokedAt !== null) {
        // token is already revoked
        throw new ApiError(
            401,
            "Unauthorized. Please loggin again"
        )
    }

    if(storedRefreshToken.expiresAt <= new Date()) {
        // token is already expired
        throw new ApiError(
            401,
            "Unauthorized. Please loggin again"
        )
    }

    // match 
    const isRefreshTokenMatched = await compareRefreshToken(oldRefreshToken, storedRefreshToken.tokenHash);

    if(!isRefreshTokenMatched) {
        throw new ApiError(
            401,
            "Unauthorized. Please loggin again"
        )
    }

    // generate new access and refresh token
    const newAccessToken = generateAccessToken(userId, role);
    const { token: newRefreshToken, jti: newJti } = generateRefreshToken(userId, role);

    // hash new refresh token
    const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);

    /*
    
    Database related actions 
    --> Here, what if update happens and then creation failed (for some reason), then 
        result : previous of is revoked and new one is not created and user gets loggedout

        To handle this, either both update and create happens or none

        this way even if creation failed, it rolebacks and the previous become valid again

        use database transections
    */

    await prisma.$transaction(async(tx) => {

        // update refresh token table
        await tx.refreshToken.update({
            where: {jti},
            data : {
                revokedAt: new Date()
            }
        });

        // create new session of user
        await tx.refreshToken.create({
            data: {
                userId,
                tokenHash: newRefreshTokenHash,
                jti: newJti,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
    })


    return { newAccessToken, newRefreshToken };

}
