/*
Express's Request type doesn't have userId by default.
 
Need to extend it.

*/

import { Role } from "../generated/prisma/enums.ts";

declare global {
    namespace Express {
        interface Request {
            userId: number;
            role: Role;
            idempotencyKey: string;
            walletId: number;

        }
    }
}

export {};