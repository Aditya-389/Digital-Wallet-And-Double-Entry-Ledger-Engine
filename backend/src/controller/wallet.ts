import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/ApiResponse.ts';
import { createWalletService, walletLookupService } from '../service/wallet.ts';


export const createWallet = async(req: Request, res: Response) => {
    const userId = req.userId;
    const { name, currency }  = req.body;

    if(!userId) {
        return res.status(401).json(
            errorResponse(
                "No userId found. Please login again"
            )
        );
    }

    const wallet = await createWalletService(userId, currency, name);

    return res.status(201).json(
        successResponse(
            "Wallet created successfully",
            wallet
        )
    );
} 


export const walletLookup = async(req: Request, res: Response) => {
    const userId = req.userId;

    if(!userId) {
        return res.status(401).json(
            errorResponse(
                "No userId found. Please login again"
            )
        );
    }

    const wallets = await walletLookupService(userId);

    return res.status(201).json(
        successResponse(
            "Wallet fetched successfully",
            wallets
        )
    );

}