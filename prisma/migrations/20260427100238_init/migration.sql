-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VENDOR', 'HOST', 'ADMIN');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ART_CRAFT', 'FOOD_BEVERAGE', 'FASHION_BEAUTY', 'TECH_GADGETS', 'HOME_LIVING', 'CORPORATE_TRADE', 'ANIME_COMIC', 'THRIFT_VINTAGE', 'WELLNESS_FITNESS', 'PET_FAIR', 'EDUCATIONAL', 'OTHERS');

-- CreateEnum
CREATE TYPE "BoothType" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'LOCKED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('HOST_APPROVAL');

-- CreateEnum
CREATE TYPE "AdminRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailLogCategory" AS ENUM ('VERIFICATION', 'PASSWORD_RESET', 'BOOKING_CONFIRMATION', 'HOST_APPROVED', 'ADMIN_INVITATION');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'BOUNCED', 'COMPLAINED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" TEXT,
    "salt" VARCHAR(32),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'HOST',
    "stripe_account_id" VARCHAR(255),
    "stripe_payout_enabled" BOOLEAN NOT NULL DEFAULT false,
    "profile_photo" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verify_tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_in" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verify_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_in" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_in" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "category" "Category" NOT NULL DEFAULT 'OTHERS',
    "host_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "currency_code" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_images" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "event_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booths" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "type" "BoothType" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booth_bookings" (
    "id" SERIAL NOT NULL,
    "booth_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'USD',
    "payment_status" "PaymentStatus" NOT NULL,
    "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" VARCHAR(255),
    "booth_name" VARCHAR(50),
    "event_name" VARCHAR(255),
    "cardBrand" VARCHAR(20),
    "cardLast4" VARCHAR(4),
    "stripeChargeId" VARCHAR(255),
    "receiptUrl" TEXT,

    CONSTRAINT "booth_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "status" "AdminRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "admin_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category" "EmailLogCategory" NOT NULL,
    "status" "EmailLogStatus" NOT NULL DEFAULT 'PENDING',
    "email_id" VARCHAR(255),
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_exchange" (
    "id" SERIAL NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_exchange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_event_id_key" ON "bookmarks"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "verify_tokens_token_key" ON "verify_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "reset_tokens_token_key" ON "reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "admin_tokens_email_key" ON "admin_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_tokens_token_key" ON "admin_tokens"("token");

-- CreateIndex
CREATE INDEX "events_slug_idx" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "currency_exchange_currency_key" ON "currency_exchange"("currency");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verify_tokens" ADD CONSTRAINT "verify_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_tokens" ADD CONSTRAINT "reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currency_exchange"("currency") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_images" ADD CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booths" ADD CONSTRAINT "booths_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_bookings" ADD CONSTRAINT "booth_bookings_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currency_exchange"("currency") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_bookings" ADD CONSTRAINT "booth_bookings_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_bookings" ADD CONSTRAINT "booth_bookings_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_requests" ADD CONSTRAINT "admin_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
