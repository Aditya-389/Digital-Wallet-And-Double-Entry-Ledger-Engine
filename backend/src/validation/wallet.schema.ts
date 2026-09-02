import { z } from 'zod';

export const walletCreateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(69, "Name is too long")
        .optional(),

    currency: z
        .string()
        .trim()
        .length(3, "Currency must be a 3-letter ISO code")
        .toUpperCase(),

}).strict();


export type walletCreationInput = z.infer<typeof walletCreateSchema>;


/*
Edge case --> "XYZ" passes even though it may not be a real ISO 4217 currency.

Sol: 

3 letters
   ↓
check against ISO 4217 currency list
   ↓
accept/reject


*/