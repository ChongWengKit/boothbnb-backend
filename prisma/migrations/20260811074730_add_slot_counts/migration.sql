-- AlterTable
ALTER TABLE "events" ADD COLUMN     "available_slots" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_slots" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing events with counts from their booths
UPDATE "events" e
SET
    "total_slots" = (
        SELECT COUNT(*) FROM "booths" b WHERE b."event_id" = e."id"
    ),
    "available_slots" = (
        SELECT COUNT(*) FROM "booths" b WHERE b."event_id" = e."id" AND b."type" = 'AVAILABLE'
    );