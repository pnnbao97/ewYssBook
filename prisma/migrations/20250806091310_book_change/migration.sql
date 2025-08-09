/*
  Warnings:

  - You are about to drop the column `volumeNumber` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "volumeNumber",
ADD COLUMN     "allVolumePriceForBlackAndWhite" INTEGER,
ADD COLUMN     "allVolumePriceForColor" INTEGER,
ADD COLUMN     "allVolumePriceForLivebook" INTEGER;
