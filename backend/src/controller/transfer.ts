import { Request, Response } from 'express';
import { createTransferServie } from '../service/transfer.ts';
import { successResponse } from '../utils/ApiResponse.ts';


export const createTransfer = async(req: Request, res: Response) => {
    const {sourceWalletId, destinationWalletId, amount } = req.body;
    const userId = req.userId;
    const idempotencyKey = req.idempotencyKey;
    
    const transfer = await createTransferServie(
        userId,
        sourceWalletId,
        destinationWalletId, 
        amount,
        idempotencyKey
    );


    return res.status(201).json(
        successResponse(
            "Transaction Successfull",
            transfer
        )
    );
}