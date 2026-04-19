/*
  Warnings:

  - Added the required column `amount` to the `booth_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booth_bookings" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL;
