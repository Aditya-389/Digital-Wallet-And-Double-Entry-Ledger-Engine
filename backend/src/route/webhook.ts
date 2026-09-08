import express from "express";

import { paymentWebhook } from "../controller/webhook.ts";

const router = express.Router();

router.post(
    "/payment",
    express.raw({
        type: "application/json",
    }),
    paymentWebhook
);

export default router;