/*
  Warnings:

  - You are about to drop the column `category_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ART_CRAFT', 'FOOD_BEVERAGE', 'FASHION_BEAUTY', 'TECH_GADGETS', 'HOME_LIVING', 'CORPORATE_TRADE', 'ANIME_COMIC', 'THRIFT_VINTAGE', 'WELLNESS_FITNESS', 'PET_FAIR', 'EDUCATIONAL', 'OTHERS');

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_category_id_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "category_id",
ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHERS';

-- DropTable
DROP TABLE "categories";
