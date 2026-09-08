import crypto from "crypto";
import config from "../config/env.ts";

interface CreateMockPaymentInput {
    walletId: number;
    amount: string;
    currency: string;
}

interface MockPayment {
    providerPaymentId: string;
    walletId: number;
    amount: string;
    currency: string;
}

export const createMockPayment = (
    payment: CreateMockPaymentInput
): MockPayment => {

    return {
        providerPaymentId: `mock_pay_${crypto.randomUUID()}`,
        walletId: payment.walletId,
        amount: String(payment.amount),
        currency: payment.currency,
    };
};


export const sendPaymentWebhook = async (
    payment: MockPayment
) => {

    const eventId = `mock_evt_${crypto.randomUUID()}`;

    const payload = {
        eventId,
        type: "payment.succeeded",
        paymentId: payment.providerPaymentId,
        walletId: payment.walletId,
        amount: payment.amount,
        currency: payment.currency,
    };

    const rawBody = JSON.stringify(payload);

    const signature = crypto
        .createHmac(
            "sha256",
            config.PAYMENT_WEBHOOK_SECRET!
        )
        .update(rawBody)
        .digest("hex");

    const response = await fetch(
        `${config.PAYMENT_WEBHOOK_URL}/webhooks/payment`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "X-Payment-Signature": signature,
            },

            body: rawBody,
        }
    );

    if (!response.ok) {
        throw new Error(
            `Payment webhook failed with status ${response.status}`
        );
    }

    return {
        eventId,
        status: "SUCCEEDED" as const,
    };
};