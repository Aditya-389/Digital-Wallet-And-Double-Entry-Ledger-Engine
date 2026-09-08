import { z } from 'zod';


/*
Not accepting sourceWalletId from the client.
The source wallet should come from the authenticated user's context

E.g., sourceWallet.userId === req.userId

NOTE: 

1. The regex string represents a "positive" whole number or a decimal number with up to 4 decimal places.
2. Limits the whole number part to a maximum of 15 digits, cause my DB constrain allows upto 15 digits

*/
export const transferSchema = z.object({
    sourceWalletId: z.number().int().positive(),
    destinationWalletId: z.number().int().positive(),
    amount: z.string().regex(/^\d{1,15}(\.\d{1,4})?$/), // taking amount in string
}).strict();


export type transferSchemaInput = z.infer<typeof transferSchema>;
