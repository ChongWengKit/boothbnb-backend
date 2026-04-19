/*
  Warnings:

  - You are about to drop the column `is_available` on the `booths` table. All the data in the column will be lost.
  - You are about to drop the column `specifications` on the `booths` table. All the data in the column will be lost.
  - Added the required column `height` to the `booths` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `booths` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `booths` table without a default value. This is not possible if the table is not empty.
  - Added the required column `x` to the `booths` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `booths` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booths" DROP COLUMN "is_available",
DROP COLUMN "specifications",
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "type" VARCHAR(20) NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL,
ADD COLUMN     "x" INTEGER NOT NULL,
ADD COLUMN     "y" INTEGER NOT NULL;
