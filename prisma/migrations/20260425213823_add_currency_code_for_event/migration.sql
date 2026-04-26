-- AlterTable
ALTER TABLE "events" ADD COLUMN     "currency_code" TEXT NOT NULL DEFAULT 'USD';

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currency_exchange"("currency") ON DELETE RESTRICT ON UPDATE CASCADE;
