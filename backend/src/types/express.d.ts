/*
Express's Request type doesn't have userId by default.
 
Need to extend it.

*/

declare global {
    namespace Express {
        interface Request {
            userId: number;
        }
    }
}

export {};