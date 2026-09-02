import { prisma } from "../database/db.ts"
import { ApiError } from "../utils/ApiError.ts";





export const createWalletService = async(userId: number, currency: string, name?: string) => {
    // find user 
    const user  = await prisma.user.findUnique({
        where: {id: userId}
    });

    if(!user || !user.isActive) {
        throw new ApiError(401, "user not found, or user is deactivated. Please contact admin");
    }

    // validate currency
    const validCurrency = Intl.supportedValuesOf("currency");

    if(!validCurrency.includes(currency)) {
        throw new ApiError(400, "Invalid currency type. Please enter valid currency type");
    }

    // create wallet
    const wallet = await prisma.wallet.create({
        data: {
            userId: userId,
            name: name,
            currency: currency,

        }
    });

    return wallet;
}


export const walletLookupService = async(userId: number) => {
    // find user 
    const user  = await prisma.user.findUnique({
        where: {id: userId}
    });

    if(!user || !user.isActive) {
        throw new ApiError(401, "user not found, or user is deactivated. Please contact admin");
    }

    const wallets = await prisma.wallet.findMany({
        where: {userId}
    });

    return wallets;
}