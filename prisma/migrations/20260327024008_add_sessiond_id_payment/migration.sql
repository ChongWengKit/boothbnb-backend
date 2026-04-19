/*
  Warnings:

  - Added the required column `session_id` to the `booth_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booth_bookings" ADD COLUMN     "session_id" VARCHAR(255) NOT NULL;
