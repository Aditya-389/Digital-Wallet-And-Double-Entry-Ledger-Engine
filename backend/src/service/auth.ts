import { prisma } from "../database/db.ts";
import { ApiError } from "../utils/ApiError.ts";
import { hashPassword } from "../utils/argon.ts";




export const registerUserService = async(name: string, email: string, password: string) => {
    
    // user already Exists? 
    const alreadyExistsUser = await prisma.user.findUnique({
        where: {email : email}
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
