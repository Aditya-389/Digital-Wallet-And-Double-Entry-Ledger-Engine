import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/ApiResponse.ts';
import { createWalletService, deactivateWalletService, singleWalletDetailsService, walletLookupService } from '../service/wallet.ts';


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

export const singleWalletDetails = async(req: Request, res: Response) => {
    const userId = req.userId;
    const walletId = Number(req.params.id);

    if(!walletId) {
        return res.status(400).json(
            errorResponse("Please select valid wallet")
        )
    }

    const wallet = await singleWalletDetailsService(userId, walletId);

    return res.status(201).json(
        successResponse(
            "Wallet fetched successfully",
            wallet
        )
    );
}

export const deactivateWallet = async(req: Request, res: Response) => {
    const userId = req.userId;
    const walletId = Number(req.params.id);

    if(!walletId) {
        return res.status(400).json(
            errorResponse("Please select valid wallet")
        )
    }

    const wallet = await deactivateWalletService(userId, walletId);

    return res.status(201).json(
        successResponse(
            "Wallet deactivate successfully",
            wallet
        )
    );

}