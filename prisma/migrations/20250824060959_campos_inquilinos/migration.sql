/*
  Warnings:

  - Added the required column `cnpj` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marital_status` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipal_registration` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state_registration` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "cnpj" VARCHAR(20) NOT NULL,
ADD COLUMN     "cpf" VARCHAR(14) NOT NULL,
ADD COLUMN     "marital_status" TEXT NOT NULL,
ADD COLUMN     "municipal_registration" INTEGER NOT NULL,
ADD COLUMN     "state_registration" INTEGER NOT NULL;
