/*
  Warnings:

  - The values [UPDATE_USER] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionType_new" AS ENUM ('HOST_APPROVAL');
ALTER TABLE "admin_requests" ALTER COLUMN "action_type" TYPE "ActionType_new" USING ("action_type"::text::"ActionType_new");
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
ALTER TYPE "ActionType_new" RENAME TO "ActionType";
DROP TYPE "public"."ActionType_old";
COMMIT;
