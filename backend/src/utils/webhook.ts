import crypto from "crypto";
import config from "../config/env.ts";

export const verifyWebhookSignature = (
    rawBody: Buffer,
    signature: string
): boolean => {

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            config.PAYMENT_WEBHOOK_SECRET!
        )
        .update(rawBody)
        .digest("hex");

    const expected = Buffer.from(
        expectedSignature,
        "utf8"
    );

    const received = Buffer.from(
        signature,
        "utf8"
    );

    if (expected.length !== received.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        expected,
        received
    );
};