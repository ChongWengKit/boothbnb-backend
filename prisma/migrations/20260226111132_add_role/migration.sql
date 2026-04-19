-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VENDOR', 'HOST', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'HOST';
