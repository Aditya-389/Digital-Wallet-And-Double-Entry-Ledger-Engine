import { Request, Response } from "express";

import { ApiError } from "../utils/ApiError.ts";
import { verifyWebhookSignature } from "../utils/webhook.ts";
import { paymentWebhookSchema } from "../validation/payment.webhook.schema.ts";
import { processPaymentWebhook } from "../service/paymentWebhook.ts";

export const paymentWebhook = async (
    req: Request,
    res: Response
) => {

    const signature =
        req.get("X-Payment-Signature");

    if (!signature) {
        throw new ApiError(
            401,
            "Missing webhook signature"
        );
    }

    // Because express.raw() is used for this route,
    // req.body is a Buffer.
    const rawBody = req.body as Buffer;

    if (!Buffer.isBuffer(rawBody)) {
        throw new ApiError(
            500,
            "Raw webhook body unavailable"
        );
    }

    // 1. Verify HMAC
    const isValid =
        verifyWebhookSignature(
            rawBody,
            signature
        );

    if (!isValid) {
        throw new ApiError(
            401,
            "Invalid webhook signature"
        );
    }

    // 2. Parse JSON
    let parsedBody: unknown;

    try {
        parsedBody =
            JSON.parse(rawBody.toString("utf8"));
    } catch {
        throw new ApiError(
            400,
            "Invalid JSON payload"
        );
    }

    // 3. Validate webhook payload
    const result =
        paymentWebhookSchema.safeParse(
            parsedBody
        );

    if (!result.success) {
        throw new ApiError(
            400,
            "Invalid webhook payload"
        );
    }

    // 4. Process financial operation
    const resultData =
        await processPaymentWebhook(
            result.data
        );

    return res.status(200).json({
        success: true,
        message: resultData.alreadyProcessed
            ? "Webhook already processed"
            : "Payment processed successfully",
    });
};