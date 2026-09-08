import { z } from "zod";

export const paymentWebhookSchema = z.object({

    eventId: z
        .string()
        .min(1),

    type: z
        .literal("payment.succeeded"),

    paymentId: z
        .string()
        .min(1),

    walletId: z
        .number()
        .int()
        .positive(),

    amount: z
        .string()
        .regex(
            /^\d{1,15}(\.\d{1,4})?$/,
            "Invalid amount"
        ),

    currency: z
        .string()
        .length(3)
        .toUpperCase(),

}).strict();

export type PaymentWebhookInput =
    z.infer<typeof paymentWebhookSchema>;