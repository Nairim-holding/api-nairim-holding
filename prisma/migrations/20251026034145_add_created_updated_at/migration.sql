/*
  Warnings:

  - Added the required column `updated_at` to the `AgencyAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `AgencyContact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `OwnerAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `OwnerContact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PropertyAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PropertyType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PropertyValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `TenantAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `TenantContact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgencyAddress" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AgencyContact" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OwnerAddress" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OwnerContact" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PropertyAddress" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PropertyType" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PropertyValue" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TenantAddress" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TenantContact" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
