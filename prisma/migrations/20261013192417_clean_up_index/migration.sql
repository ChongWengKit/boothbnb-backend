-- DropIndex
DROP INDEX "admin_requests_status_idx";

-- DropIndex
DROP INDEX "reset_tokens_user_id_expires_in_idx";

-- CreateIndex
CREATE INDEX "admin_requests_status_action_type_idx" ON "admin_requests"("status", "action_type");

-- CreateIndex
CREATE INDEX "reset_tokens_user_id_expires_in_created_at_idx" ON "reset_tokens"("user_id", "expires_in", "created_at");
