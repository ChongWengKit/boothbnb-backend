-- DropIndex
DROP INDEX "admin_requests_action_type_idx";

-- DropIndex
DROP INDEX "admin_requests_status_idx";

-- DropIndex
DROP INDEX "booth_bookings_vendor_id_idx";

-- DropIndex
DROP INDEX "booths_id_type_idx";

-- DropIndex
DROP INDEX "email_logs_category_idx";

-- DropIndex
DROP INDEX "events_category_idx";

-- DropIndex
DROP INDEX "events_end_date_idx";

-- DropIndex
DROP INDEX "events_host_id_idx";

-- DropIndex
DROP INDEX "events_latitude_idx";

-- DropIndex
DROP INDEX "events_longitude_idx";

-- DropIndex
DROP INDEX "events_slug_idx";

-- DropIndex
DROP INDEX "events_start_date_idx";

-- DropIndex
DROP INDEX "events_status_idx";

-- DropIndex
DROP INDEX "reset_tokens_user_id_expires_in_created_at_idx";

-- CreateIndex
CREATE INDEX "admin_requests_status_idx" ON "admin_requests"("status");

-- CreateIndex
CREATE INDEX "booth_bookings_vendor_id_booked_at_idx" ON "booth_bookings"("vendor_id", "booked_at");

-- CreateIndex
CREATE INDEX "booth_bookings_booth_id_idx" ON "booth_bookings"("booth_id");

-- CreateIndex
CREATE INDEX "booths_event_id_idx" ON "booths"("event_id");

-- CreateIndex
CREATE INDEX "event_images_event_id_idx" ON "event_images"("event_id");

-- CreateIndex
CREATE INDEX "events_slug_status_idx" ON "events"("slug", "status");

-- CreateIndex
CREATE INDEX "events_host_id_status_idx" ON "events"("host_id", "status");

-- CreateIndex
CREATE INDEX "events_status_start_date_idx" ON "events"("status", "start_date");

-- CreateIndex
CREATE INDEX "events_status_category_start_date_idx" ON "events"("status", "category", "start_date");

-- CreateIndex
CREATE INDEX "events_status_latitude_idx" ON "events"("status", "latitude");

-- CreateIndex
CREATE INDEX "reset_tokens_user_id_expires_in_idx" ON "reset_tokens"("user_id", "expires_in");

-- CreateIndex
CREATE INDEX "users_stripe_account_id_idx" ON "users"("stripe_account_id");
