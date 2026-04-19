/*
  Warnings:

  - The values [OBJECT] on the enum `BoothType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BoothType_new" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'LOCKED');
ALTER TABLE "booths" ALTER COLUMN "type" TYPE "BoothType_new" USING ("type"::text::"BoothType_new");
ALTER TYPE "BoothType" RENAME TO "BoothType_old";
ALTER TYPE "BoothType_new" RENAME TO "BoothType";
DROP TYPE "public"."BoothType_old";
COMMIT;
