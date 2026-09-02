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


export const singleWalletDetailsService = async(userId: number, walletId: number) => {
    // find wallet 
    const wallet = await prisma.wallet.findUnique({
        where: {id: walletId}
    });

    if(!wallet) {
        throw new ApiError(
            404,
            "wallet not found."
        )
    }

    // preventing user A to access user B's wallets by comparing creator id's (i.e., userId's)
    if(wallet.userId !== userId) {
        throw new ApiError(
            401,
            "user not authorized to view this wallet"
        )
    }

    return wallet;
}

export const deactivateWalletService = async(userId: number, walletId: number) => {
  // find wallet 
    const wallet = await prisma.wallet.findUnique({
        where: {id: walletId}
    });

    if(!wallet) {
        throw new ApiError(
            404,
            "wallet not found."
        )
    }

    // preventing user A to access user B's wallets by comparing creator id's (i.e., userId's)
    if(wallet.userId !== userId) {
        throw new ApiError(
            401,
            "user not authorized to view this wallet"
        )
    }
    
    await prisma.wallet.update({
        where: {id: walletId},
        data: {
            isActive: false
        } 
    });

    return wallet;
} 