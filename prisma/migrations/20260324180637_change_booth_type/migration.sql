/*
  Warnings:

  - Changed the type of `type` on the `booths` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BoothType" AS ENUM ('AVAILABLE', 'RESERVED', 'OBJECT');

-- AlterTable
ALTER TABLE "booths" DROP COLUMN "type",
ADD COLUMN     "type" "BoothType" NOT NULL;
