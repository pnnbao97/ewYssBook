-- AlterEnum
ALTER TYPE "public"."BookVersion" ADD VALUE 'livebook';

-- AlterTable
ALTER TABLE "public"."Book" ADD COLUMN     "allVolumeLink" TEXT,
ADD COLUMN     "hasMoreThanOneVolume" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSeries" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "livebookPrice" INTEGER,
ADD COLUMN     "seriesLink" TEXT,
ADD COLUMN     "seriesName" TEXT,
ADD COLUMN     "volumeCount" INTEGER,
ADD COLUMN     "volumeNumber" INTEGER;
