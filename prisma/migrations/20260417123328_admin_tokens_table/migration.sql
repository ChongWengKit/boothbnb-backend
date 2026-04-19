-- CreateTable
CREATE TABLE "admin_tokes" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_in" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_tokes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_tokes_email_key" ON "admin_tokes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_tokes_token_key" ON "admin_tokes"("token");
