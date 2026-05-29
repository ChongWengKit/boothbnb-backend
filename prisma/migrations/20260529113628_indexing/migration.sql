-- CreateIndex
CREATE INDEX "admin_requests_action_type_idx" ON "admin_requests"("action_type");

-- CreateIndex
CREATE INDEX "admin_requests_status_idx" ON "admin_requests"("status");

-- CreateIndex
CREATE INDEX "admin_requests_user_id_idx" ON "admin_requests"("user_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_created_at_idx" ON "bookmarks"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "booth_bookings_vendor_id_idx" ON "booth_bookings"("vendor_id");

-- CreateIndex
CREATE INDEX "booth_bookings_payment_status_idx" ON "booth_bookings"("payment_status");

-- CreateIndex
CREATE INDEX "booths_id_type_idx" ON "booths"("id", "type");

-- CreateIndex
CREATE INDEX "currency_exchange_is_enabled_currency_idx" ON "currency_exchange"("is_enabled", "currency");

-- CreateIndex
CREATE INDEX "email_logs_category_idx" ON "email_logs"("category");

-- CreateIndex
CREATE INDEX "email_logs_status_attempts_idx" ON "email_logs"("status", "attempts");

-- CreateIndex
CREATE INDEX "email_logs_email_id_idx" ON "email_logs"("email_id");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_host_id_idx" ON "events"("host_id");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_end_date_idx" ON "events"("end_date");

-- CreateIndex
CREATE INDEX "events_latitude_idx" ON "events"("latitude");

-- CreateIndex
CREATE INDEX "events_longitude_idx" ON "events"("longitude");

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");

-- CreateIndex
CREATE INDEX "reset_tokens_user_id_expires_in_created_at_idx" ON "reset_tokens"("user_id", "expires_in", "created_at");
