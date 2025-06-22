/*
  Warnings:

  - You are about to drop the column `name` on the `PropertyValue` table. All the data in the column will be lost.
  - Changed the type of `number` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "number",
ADD COLUMN     "number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PropertyValue" DROP COLUMN "name";
