-- CreateEnum
CREATE TYPE "ColumnPosition" AS ENUM ('LEFT', 'RIGHT', 'FULL');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "columnPosition" "ColumnPosition" NOT NULL DEFAULT 'FULL',
ADD COLUMN     "slideGroup" INTEGER NOT NULL DEFAULT 1;
