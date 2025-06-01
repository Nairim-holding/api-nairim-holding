/*
  Warnings:

  - Changed the type of `floor_number` on the `Property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "floor_number",
ADD COLUMN     "floor_number" INTEGER NOT NULL;
