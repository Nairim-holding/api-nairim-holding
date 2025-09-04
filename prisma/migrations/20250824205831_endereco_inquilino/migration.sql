-- CreateTable
CREATE TABLE "TenantAddress" (
    "id" SERIAL NOT NULL,
    "address_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "TenantAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantAddress" ADD CONSTRAINT "TenantAddress_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantAddress" ADD CONSTRAINT "TenantAddress_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
