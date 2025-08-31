import prisma from "../../prisma/client";
import { Prisma } from "@prisma/client";

export async function getTenants(
  limit = 10,
  page = 1,
  search?: string,
  sortOptions?: {
    sort_id?: string;
    sort_name?: string;
    sort_internal_code?: string;
    sort_occupation?: string;
    sort_marital_status?: string;
    sort_cnpj?: string;
    sort_cpf?: string;
    sort_state_registration?: string;
    sort_municipal_registration?: string;
  }
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.TenantWhereInput = {};

  if (search) {
    const normalized = search.trim();
    whereClause = {
      OR: [
        { name: { contains: normalized, mode: insensitiveMode } },
        { occupation: { contains: normalized, mode: insensitiveMode } },
        ...(Number(normalized) ? [{ internal_code: { equals: Number(normalized) } }] : []),
      ],
    };
  }

  const orderBy: Prisma.Enumerable<Prisma.TenantOrderByWithRelationInput> = [];

  const addOrder = (field: string | undefined, dbField: string | undefined = field) => {
    if (!field) return;
    orderBy.push({ [dbField!]: field.toLowerCase() === "desc" ? "desc" : "asc" });
  };

  addOrder(sortOptions?.sort_id, "id");
  addOrder(sortOptions?.sort_name, "name");
  addOrder(sortOptions?.sort_internal_code, "internal_code");
  addOrder(sortOptions?.sort_occupation, "occupation");
  addOrder(sortOptions?.sort_marital_status, "marital_status");
  addOrder(sortOptions?.sort_cnpj, "cnpj");
  addOrder(sortOptions?.sort_cpf, "cpf");
  addOrder(sortOptions?.sort_state_registration, "state_registration");
  addOrder(sortOptions?.sort_municipal_registration, "municipal_registration");

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  try {
    const [data, count] = await Promise.all([
      prisma.tenant.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
        include: {
          addresses: { include: { address: true } },
          contacts: { include: { contact: true } }, 
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

export async function getTenantsById(id: number) {
  return await prisma.tenant.findUnique({
    where: { id },
    include: {
      leases: true,
      contacts: {
        include: {
          contact: true,
        },
      },
      addresses: {
        include: {
          address: true,
        },
      },
    },
  });
}

export async function createTenants(data: any) {
  return await prisma.$transaction(async (tx) => {
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        internal_code: +data.internal_code,
        occupation: data.occupation,
        marital_status: data.marital_status,
        cnpj: data.cnpj,
        cpf: data.cpf,
        state_registration: +data.state_registration,
        municipal_registration: +data.municipal_registration,
      },
    });

    for (const contact of data.contacts ?? []) {
      const createdContact = await tx.contact.create({
        data: {
          contact: contact.contact,
          telephone: contact.telephone,
          phone: contact.phone,
          email: contact.email,
          whatsapp: false,
        },
      });

    for (const address of data.addresses ?? []) {
      const createdAddress = await tx.address.create({
        data: {
          zip_code: address.zip_code,
          street: address.street,
          number: +address.number,
          district: address.district,
          city: address.city,
          state: address.state,
          country: address.country,
        },
      });

      await tx.tenantAddress.create({
        data: {
          address_id: createdAddress.id,
          tenant_id: tenant.id,
        },
      });
    }

      await tx.tenantContact.create({
        data: {
          contact_id: createdContact.id,
          tenant_id: tenant.id,
        },
      });
    }
    return tenant;
  });
}

export async function deleteTenant(id: number) {
  return await prisma.$transaction(async (tx) => {
    await tx.tenantContact.deleteMany({ where: { tenant_id: id } });
    await tx.tenantAddress.deleteMany({ where: { tenant_id: id } });

    return await tx.tenant.delete({ where: { id } });
  });
}

export async function updateTenant(id: number, data: any) {
  return await prisma.$transaction(async (tx) => {
    const updatedTenant = await tx.tenant.update({
      where: { id },
      data: {
        name: data.name,
        internal_code: +data.internal_code,
        occupation: data.occupation,
        marital_status: data.marital_status,
        cnpj: data.cnpj,
        cpf: data.cpf,
        state_registration: +data.state_registration,
        municipal_registration: +data.municipal_registration,
      },
    });

    if (data.contacts) {
      await tx.tenantContact.deleteMany({ where: { tenant_id: id } });

      for (const contact of data.contacts) {
        const createdContact = await tx.contact.create({
          data: {
            contact: contact.contact,
            telephone: contact.telephone,
            phone: contact.phone,
            email: contact.email,
            whatsapp: false
          },
        });

        await tx.tenantContact.create({
          data: {
            contact_id: createdContact.id,
            tenant_id: id,
          },
        });
      }
    }

    if (data.addresses) {
      await tx.tenantAddress.deleteMany({ where: { tenant_id: id } });

      for (const address of data.addresses) {
        const createdAddress = await tx.address.create({
          data: {
            zip_code: address.zip_code,
            street: address.street,
            number: +address.number,
            district: address.district,
            city: address.city,
            state: address.state,
            country: address.country,
          },
        });

        await tx.tenantAddress.create({
          data: {
            address_id: createdAddress.id,
            tenant_id: id,
          },
        });
      }
    }
    return updatedTenant;
  });
}
