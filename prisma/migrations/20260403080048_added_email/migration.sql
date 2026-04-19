-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "EmailLogStatus" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);
