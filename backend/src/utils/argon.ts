import argon2 from "argon2";

export const hashPassword = async(password: string) => {
    return await argon2.hash(
        password, 
        {
            type: argon2.argon2id,
        }
    );
}

export const comparePassword = async(password: string, passwordHash: string) => {
    return await argon2.verify(passwordHash, password);
}


export const hashRefreshToken = async(refreshToken: string) => {
    return await argon2.hash(
        refreshToken,
        {
            type: argon2.argon2id,
        }
    )
}

export const compareRefreshToken = async(refreshToken: string, refreshTokenHash: string) => {
    return await argon2.verify(refreshTokenHash, refreshToken);
}

/*
Register:
password → Argon2id → passwordHash → DB

Login:
password + passwordHash → verify → true/false

*/

