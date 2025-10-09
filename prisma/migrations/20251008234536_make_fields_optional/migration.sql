-- AlterTable
ALTER TABLE "Lease" ALTER COLUMN "condo_fee" DROP NOT NULL,
ALTER COLUMN "property_tax" DROP NOT NULL,
ALTER COLUMN "extra_charges" DROP NOT NULL,
ALTER COLUMN "agency_commission" DROP NOT NULL,
ALTER COLUMN "commission_amount" DROP NOT NULL,
ALTER COLUMN "tax_due_date" DROP NOT NULL,
ALTER COLUMN "condo_due_date" DROP NOT NULL;
