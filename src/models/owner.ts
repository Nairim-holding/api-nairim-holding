import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";

export async function getOwners(
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

  // Filtro de busca
  let whereClause: Prisma.OwnerWhereInput = {};
  if (search) {
    const normalized = search.trim();
    whereClause = {
      OR: [
        { name: { contains: normalized, mode: insensitiveMode } },
        { cpf: { contains: normalized, mode: insensitiveMode } },
        { cnpj: { contains: normalized, mode: insensitiveMode } },
      ],
    };
  }

  // Ordenação
  const orderBy: Prisma.Enumerable<Prisma.OwnerOrderByWithRelationInput> = [];
  const addOrder = (field: string | undefined, dbField: string | undefined = field) => {
    if (!field) return;
    orderBy.push({ [dbField!]: field.toLowerCase() === "desc" ? "desc" : "asc" });
  };

  // Campos diretos do Owner
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
      prisma.owner.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
        include: {
          addresses: { include: { address: true } }, // Não dá para ordenar aqui
          contacts: { include: { contact: true } },  // Não dá para ordenar aqui
        },
      }),
      prisma.owner.count({ where: whereClause }),
    ]);

    return {
      data: data || [],
      count: count || 0,
      totalPages: count ? Math.ceil(count / take) : 0,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erro no getOwners:", error);
    throw new Error("Erro ao buscar proprietários.");
  }
}


export async function getOwnerById(id: number) {
  return await prisma.owner.findUnique({
    where: { id },
    include: {
      properties: true,
      leases: true,
      addresses: {
        include: {
          address: true,
        },
      },
      contacts: {
        include: {
          contact: true,
        },
      },
    },
  });
}

export async function createOwners(data: any) {
  return await prisma.$transaction(async (tx) => {
    const owner = await tx.owner.create({
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

      await tx.ownerContact.create({
        data: {
          contact_id: createdContact.id,
          owner_id: owner.id,
        },
      });
    }

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

      await tx.ownerAddress.create({
        data: {
          address_id: createdAddress.id,
          owner_id: owner.id,
        },
      });
    }

    return owner;
  });
}

export async function deleteOwners(id: number) {
  return await prisma.$transaction(async (tx) => {
    await tx.ownerAddress.deleteMany({ where: { owner_id: id } });
    await tx.ownerContact.deleteMany({ where: { owner_id: id } });

    return await tx.owner.delete({ where: { id } });
  });
}

export async function updateOwner(id: number, data: any) {
  return await prisma.$transaction(async (tx) => {
    const updatedOwner = await tx.owner.update({
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
      await tx.ownerContact.deleteMany({ where: { owner_id: id } });

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

        await tx.ownerContact.create({
          data: {
            contact_id: createdContact.id,
            owner_id: id,
          },
        });
      }
    }

    if (data.addresses) {
      await tx.ownerAddress.deleteMany({ where: { owner_id: id } });

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

        await tx.ownerAddress.create({
          data: {
            address_id: createdAddress.id,
            owner_id: id,
          },
        });
      }
    }

    return updatedOwner;
  });
}
