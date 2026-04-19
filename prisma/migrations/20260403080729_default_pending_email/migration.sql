/*
  Warnings:

  - Added the required column `category` to the `email_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailLogCategory" AS ENUM ('VERIFICATION', 'PASSWORD_RESET', 'BOOKING_CONFIRMATION');

-- AlterTable
ALTER TABLE "email_logs" ADD COLUMN     "category" "EmailLogCategory" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
