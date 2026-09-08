import { Request, Response } from "express";

import { createPaymentService } from "../service/payment.ts";
import { successResponse } from "../utils/ApiResponse.ts";

export const createPayment = async (
    req: Request,
    res: Response
) => {

    const {
        amount,
        walletId
    } = req.body;

    const userId = req.userId!;

    const payment =
        await createPaymentService({
            userId,
            walletId,
            amount,
        });

    return res.status(201).json(
        successResponse(
            "Payment initiated successfully",
            payment
        )
    );
};