import prisma from "../../prisma/client";

export async function getTenants(){
    return prisma.tenant.findMany({
    include:{
      contacts: {
        include: {
          contact: true
        }
      }
    }
  });
   
    
}

export async function createTenants(data: any) {
    return await prisma.$transaction(async (tx) => {
    const tenant = await prisma.tenant.create({
        data: {
            name: data.tenant_name,
            internal_code: data.tenant_internal_code,
            occupation: data.tenant_occupation,
            leases: data.tenant_leases,
            contacts: data.tenant_contacts,
        },
    });

    for (const contact of data.contacts ?? []) {
            const createdContact = await tx.contact.create({
                data: {
                phone: contact.phone,
                email: contact.email,
                whatsapp: contact.whatsapp,
                },
            });

            await tx.tenantContact.create({
                data: {
                contact_id: createdContact.id,
                tenant_id: tenant.id,
                },
            });
        }
    return tenant;
})
}
  
export async function deleteTenant(id: number) {
  return await prisma.$transaction(async (tx) => {
    await tx.tenantContact.deleteMany({ where: { tenant_id: id } });

    return await tx.tenant.delete({ where: { id } });
  });
}

export async function updateTenant(id: number, data: any) {
  return await prisma.$transaction(async (tx) => {
    const updatedTenant = await tx.tenant.update({
      where: { id },
      data: {
        name: data.tenant_name,
            internal_code: data.tenant_internal_code,
            occupation: data.tenant_occupation,
            leases: data.tenant_leases,
            contacts: data.tenant_contacts,
      },
  });
     return updatedTenant;
  });
}
   
