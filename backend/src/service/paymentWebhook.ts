import { prisma } from "../database/db.ts";
import { ApiError } from "../utils/ApiError.ts";
import { PaymentWebhookInput } from "../validation/payment.webhook.schema.ts";

export const processPaymentWebhook = async (
    payload: PaymentWebhookInput
) => {

    return await prisma.$transaction(async (tx) => {

        // 1. Claim webhook event
        const existingEvent =
            await tx.webhookEvent.findUnique({
                where: {
                    provider_eventId: {
                        provider: "MOCK_PAYMENT_PROVIDER",
                        eventId: payload.eventId,
                    },
                },
            });

        if (existingEvent) {

            // Already processed
            if (existingEvent.processedAt) {
                return {
                    alreadyProcessed: true,
                };
            }

            throw new ApiError(
                409,
                "Webhook event is already being processed"
            );
        }

        await tx.webhookEvent.create({
            data: {
                provider: "MOCK_PAYMENT_PROVIDER",
                eventId: payload.eventId,
                eventType: payload.type,
                payload,
            },
        });

        // 2. Find payment
        const payment =
            await tx.payment.findUnique({
                where: {
                    providerPaymentId:
                        payload.paymentId,
                },
            });

        if (!payment) {
            throw new ApiError(
                404,
                "Payment not found"
            );
        }

        // 3. Verify wallet
        if (payment.walletId !== payload.walletId) {
            throw new ApiError(
                400,
                "Payment wallet mismatch"
            );
        }

        // 4. Verify amount
        if (payment.amount.toString() !== payload.amount) {
            throw new ApiError(
                400,
                "Payment amount mismatch"
            );
        }

        // 5. Verify currency
        if (payment.currency !== payload.currency) {
            throw new ApiError(
                400,
                "Payment currency mismatch"
            );
        }

        // 6. Already completed
        if (payment.status === "COMPLETED") {

            return {
                alreadyProcessed: true,
            };
        }

        // 7. Mark payment completed
        await tx.payment.update({
            where: {
                id: payment.id,
            },

            data: {
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });

        // 8. Find wallet's ledger account
        const ledgerAccount =
            await tx.ledgerAccount.upsert({
                where: {
                    walletId: payment.walletId,
                },
                update: {},
                create: {
                    walletId: payment.walletId,
                },
            });

        // 9. Create ledger transaction
        const ledgerTransaction =
            await tx.ledgerTransaction.create({
                data: {
                    type: "DEPOSIT",
                    reference: `PAYMENT:${payment.id}`,
                },
            });

        // 10. Create CREDIT entry
        await tx.ledgerEntry.create({
            data: {
                accountId: ledgerAccount.id,

                transactionId:
                    ledgerTransaction.id,

                type: "CREDIT",

                amount: payment.amount,
            },
        });

        // 11. Mark webhook processed
        await tx.webhookEvent.update({
            where: {
                provider_eventId: {
                    provider: "MOCK_PAYMENT_PROVIDER",
                    eventId: payload.eventId,
                },
            },

            data: {
                processedAt: new Date(),
            },
        });

        return {
            alreadyProcessed: false,
            paymentId: payment.id,
        };
    });
};