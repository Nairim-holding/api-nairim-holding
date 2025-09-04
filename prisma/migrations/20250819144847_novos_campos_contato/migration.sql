/*
  Warnings:

  - Added the required column `contact` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephone` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "contact" VARCHAR(100) NOT NULL,
ADD COLUMN     "telephone" VARCHAR(20) NOT NULL;
