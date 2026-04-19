/*
  Warnings:

  - You are about to drop the `admin_tokes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "admin_tokes";

-- CreateTable
CREATE TABLE "admin_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_in" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_tokens_email_key" ON "admin_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_tokens_token_key" ON "admin_tokens"("token");
