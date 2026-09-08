-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'PENDING',
    "requestHash" TEXT NOT NULL,
    "responseCode" INTEGER,
    "responseBody" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdempotencyKey_userId_idx" ON "IdempotencyKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_userId_key_endpoint_key" ON "IdempotencyKey"("userId", "key", "endpoint");

-- AddForeignKey
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
