/*
  Warnings:

  - You are about to drop the column `contact_name` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Agency` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agency" DROP COLUMN "contact_name",
DROP COLUMN "email",
DROP COLUMN "mobile",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
