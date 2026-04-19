-- AlterTable
ALTER TABLE "booth_bookings" ADD COLUMN     "cardBrand" VARCHAR(20),
ADD COLUMN     "cardLast4" VARCHAR(4),
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "stripeChargeId" VARCHAR(255);
