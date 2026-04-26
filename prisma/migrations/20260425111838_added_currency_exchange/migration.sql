-- CreateTable
CREATE TABLE "currency_exchange" (
    "id" SERIAL NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_exchange_pkey" PRIMARY KEY ("id")
);
