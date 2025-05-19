-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DEFAULT', 'ADMIN');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('EXPIRED', 'EXPIRING', 'UP_TO_DATE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('OCCUPIED', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TITLE_DEED', 'REGISTRATION', 'OTHER');

-- CreateTable
CREATE TABLE "Agency" (
    "id" SERIAL NOT NULL,
    "trade_name" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "state_registration" INTEGER NOT NULL,
    "municipal_registration" INTEGER NOT NULL,
    "license_number" VARCHAR(20) NOT NULL,
    "contact_name" TEXT NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "mobile" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "half_bathrooms" INTEGER NOT NULL,
    "garage_spaces" INTEGER NOT NULL,
    "area_total" DOUBLE PRECISION NOT NULL,
    "area_built" DOUBLE PRECISION NOT NULL,
    "frontage" DOUBLE PRECISION NOT NULL,
    "furnished" BOOLEAN NOT NULL,
    "floor_number" VARCHAR(10) NOT NULL,
    "tax_registration" VARCHAR(20) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DEFAULT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "street" TEXT NOT NULL,
    "number" VARCHAR(10) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyContact" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "agency_id" INTEGER NOT NULL,

    CONSTRAINT "AgencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyAddress" (
    "id" SERIAL NOT NULL,
    "address_id" INTEGER NOT NULL,
    "agency_id" INTEGER NOT NULL,

    CONSTRAINT "AgencyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyAddress" (
    "id" SERIAL NOT NULL,
    "address_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,

    CONSTRAINT "PropertyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyType" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "internal_code" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,
    "marital_status" TEXT NOT NULL,
    "cnpj" VARCHAR(20) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "state_registration" INTEGER NOT NULL,
    "municipal_registration" INTEGER NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "internal_code" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "contract_number" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "LeaseStatus" NOT NULL,
    "rent_amount" DECIMAL(10,2) NOT NULL,
    "condo_fee" DECIMAL(10,2) NOT NULL,
    "property_tax" DECIMAL(10,2) NOT NULL,
    "extra_charges" DECIMAL(10,2) NOT NULL,
    "agency_commission" VARCHAR(10) NOT NULL,
    "commission_amount" DECIMAL(10,2) NOT NULL,
    "rent_due_date" TIMESTAMP(3) NOT NULL,
    "tax_due_date" TIMESTAMP(3) NOT NULL,
    "condo_due_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyValue" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "purchase_value" DECIMAL(10,2) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "sale_value" DECIMAL(10,2) NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "rental_value" DECIMAL(10,2) NOT NULL,
    "property_tax" DECIMAL(10,2) NOT NULL,
    "condo_fee" DECIMAL(10,2) NOT NULL,
    "extra_charges" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "current_status" "PropertyStatus" NOT NULL,
    "lease_rules" VARCHAR(100) NOT NULL,
    "sale_rules" VARCHAR(100) NOT NULL,
    "notes" VARCHAR(100) NOT NULL,

    CONSTRAINT "PropertyValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerAddress" (
    "id" SERIAL NOT NULL,
    "address_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,

    CONSTRAINT "OwnerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerContact" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,

    CONSTRAINT "OwnerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantContact" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "TenantContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
