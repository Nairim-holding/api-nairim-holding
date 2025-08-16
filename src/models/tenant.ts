import prisma from "../../prisma/client";
import { Prisma } from "@prisma/client";

export async function getTenants(limit = 10, page = 1, search?: string) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.TenantWhereInput = {};

  if (search) {
    const normalized = search.trim();

    whereClause = {
      OR: [
        { name: { contains: normalized, mode: insensitiveMode } },
        { occupation: { contains: normalized, mode: insensitiveMode } },
        // Se o search for um número, tenta bater com internal_code
        ...(Number(normalized)
          ? [{ internal_code: { equals: Number(normalized) } }]
          : []),
      ],
    };
  }

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  try {
    const [data, count] = await Promise.all([
      prisma.tenant.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { id: "desc" },
        select: {
          id: true,
          name: true,
          internal_code: true,
          occupation: true,
        },
      }),
      prisma.tenant.count({ where: whereClause }),
    ]);

    return {
      data: data || [],
      count: count || 0,
      totalPages: count ? Math.ceil(count / take) : 0,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erro no getTenants:", error);
    throw new Error("Erro ao buscar tenants.");
  }
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
   
