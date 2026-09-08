import { prisma } from "../database/db.ts"
import { ApiError } from "../utils/ApiError.ts";
import { Prisma } from "../generated/prisma/client.ts";


export const createTransferServie = async(
    userId: number,
    sourceWalletId: number,
    destinationWalletId: number, 
    amount: string,
    idempotencyKey: string
) => {
    return await prisma.$transaction(async(tx) => {
        // 1. find source wallet
        const sourceWallet = await tx.wallet.findFirst({
            where: {
                id: sourceWalletId,
                userId,
                isActive: true
            }
        });
        
        //2. Wrong source wallet
        if(!sourceWallet) {
            throw new ApiError(
                404,
                "Source wallet not found"
            )
        }

        //3. destination wallet varification
        const destinationWallet = await tx.wallet.findUnique({
            where: {id: destinationWalletId}
        });

        //4. check
        if(!destinationWallet) {
            throw new ApiError(
                404,
                "Destination wallet deos not exists"
            )
        }

        // 5. is destination wallet active
        if(!destinationWallet.isActive) {
            throw new ApiError(
                404,
                "Destination wallet is inactive"
            )
        }

        // 6. source and destination must be different
        if(sourceWallet.id === destinationWallet.id){
            throw new ApiError(
                400,
                "Source and destination must be different"
            )
        }

        // 7. Match currency
        if(sourceWallet.currency !== destinationWallet.currency) {
            throw new ApiError(
                400,
                "Source and Destination wallet should transfer same currency"
            )
        }

        // Create entry in idempotency table as Pending, then at the end update it
        await tx.idempotencyKey.create({
            data: {
                userId,
                key: idempotencyKey,
                endpoint: "/transfer",
                requestHash: `${sourceWalletId}:${destinationWalletId}:${amount}`,
                status: "PENDING",
            },
        });
        
        //8. lock both ledger accounts
        const ledgerAccounts = await tx.$queryRaw<{
            id: number;
            walletId: number;
        }[]>(Prisma.sql`
            SELECT "id", "walletId"
            FROM "LedgerAccount"
            WHERE "walletId" IN (${sourceWallet.id}, ${destinationWallet.id})  -- Find both account
            ORDER BY "id"
            FOR UPDATE  -- Exclusive lock
        `);

        // 9. Confirm both accounts exist
        if (ledgerAccounts.length !== 2) {
            throw new ApiError(
                500,
                "Ledger account not found for source or destination wallet"
            );
        }

        //10. find source and destination ledger accounts
        const sourceAccount = ledgerAccounts.find(
            account => account.walletId === sourceWallet.id
        );

        const destinationAccount = ledgerAccounts.find(
            account => account.walletId === destinationWallet.id
        );

        if(!sourceAccount || !destinationAccount) {
            throw new ApiError(
                500,
                "Source or destination ledger account not found"
            );
        }

        // 11. Calculate source balance 
        const creditTotal = await tx.ledgerEntry.aggregate({
            where: {
                accountId: sourceAccount.id,
                type: "CREDIT"
            },
            _sum: {
                amount: true,
            }
        });

        const debitTotal = await tx.ledgerEntry.aggregate({
            where: {
                accountId: sourceAccount.id,
                type: "DEBIT"
            },
            _sum: {
                amount: true,
            }
        });
        
        //12. balance = total credits - total debits
        const sourceCredits = creditTotal._sum.amount ?? new Prisma.Decimal(0);
        const sourceDebits  = debitTotal._sum.amount ?? new Prisma.Decimal(0); 
        const sourceBalance = sourceCredits.minus(sourceDebits);

        //13. varify sufficient balance
        const transferAmount = new Prisma.Decimal(amount);

        if(!transferAmount.gt(0)) {
            throw new ApiError(
                400,
                "Transfer amount must be greater than zero"
            );
        }

        if(sourceBalance.lessThan(transferAmount)) {
            throw new ApiError(
                400,
                "Insufficient balance"
            );
        }

        // 14. Create LedgerTransaction
        // The reference must be unique. Using the idempotency key helps prevent duplicate transfer records.
        const ledgerTransaction = await tx.ledgerTransaction.create({
            data: {
                type: "TRANSFER",
                reference: `TRANSFER:${idempotencyKey}`
                
            }
        });

        // 15. Create Debit entry --> Remove money from source wallet ledger
        await tx.ledgerEntry.create({
            data: {
                transactionId: ledgerTransaction.id,
                accountId: sourceAccount.id,
                type: "DEBIT",
                amount: transferAmount
            }
        });

        // 16. Create debit entry
        await tx.ledgerEntry.create({
            data: {
                transactionId: ledgerTransaction.id,
                accountId: destinationAccount.id,
                type: "CREDIT",
                amount: transferAmount
            }
        });
        
        // 17. update idempotency key table
        await tx.idempotencyKey.update({
            where: {
                userId_key_endpoint: {
                    userId,
                    key: idempotencyKey,
                    endpoint: "/transfer"
                }
            },
            data: {
                status: "COMPLETED",
                responseCode: 201,
                responseBody: {
                    success: true,
                    message: "Transaction successfull",
                    transactionId: ledgerTransaction.id,
                },
                completedAt: new Date(),
            },
        });

        return {
            transactionId: ledgerTransaction.id,
            sourceWalletId: sourceWallet.id,
            destinationWalletId: destinationWallet.id,
            amount: transferAmount.toString(),
            currency: sourceWallet.currency,
            status: "COMPLETED",
        };
    });
}