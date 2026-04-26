-- AlterTable
ALTER TABLE "booth_bookings" ADD COLUMN     "currency_code" TEXT NOT NULL DEFAULT 'USD';

-- AddForeignKey
ALTER TABLE "booth_bookings" ADD CONSTRAINT "booth_bookings_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currency_exchange"("currency") ON DELETE RESTRICT ON UPDATE CASCADE;
