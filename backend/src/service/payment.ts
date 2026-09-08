import { prisma } from "../database/db.ts";
import { ApiError } from "../utils/ApiError.ts";
import {
    createMockPayment,
    sendPaymentWebhook
} from "./mockPaymentProvider.ts";

interface CreatePaymentInput {
    userId: number;
    walletId: number;
    amount: string;
}

export const createPaymentService = async ({
    userId,
    walletId,
    amount,
}: CreatePaymentInput) => {

    // 1. Find wallet
    const wallet = await prisma.wallet.findUnique({
        where: {
            id: walletId,
        },
    });

    if (!wallet) {
        throw new ApiError(
            404,
            "Wallet not found"
        );
    }

    // 2. Verify ownership
    if (wallet.userId !== userId) {
        throw new ApiError(
            403,
            "You are not authorized to use this wallet"
        );
    }

    // 3. Verify wallet is active
    if (!wallet.isActive) {
        throw new ApiError(
            400,
            "Wallet is inactive"
        );
    }

    // 4. Ask mock provider to create payment
    const providerPayment = createMockPayment({
        walletId: wallet.id,
        amount,
        currency: wallet.currency,
    });

    // 5. Create internal payment
    const payment = await prisma.payment.create({
        data: {
            walletId: wallet.id,

            providerPaymentId:
                providerPayment.providerPaymentId,

            amount,

            currency: wallet.currency,

            status: "PENDING",
        },
    });

    // 6. Provider sends webhook
    await sendPaymentWebhook(providerPayment);

    return payment;
};