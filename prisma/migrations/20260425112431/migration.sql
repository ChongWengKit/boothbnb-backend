/*
  Warnings:

  - A unique constraint covering the columns `[currency]` on the table `currency_exchange` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "currency_exchange_currency_key" ON "currency_exchange"("currency");
