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
    return await argon2.verify(password, passwordHash);
}

/*
Register:
password → Argon2id → passwordHash → DB

Login:
password + passwordHash → verify → true/false

*/

