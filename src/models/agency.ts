import prisma from "../../prisma/client";
import { Prisma } from "@prisma/client";

export async function getAgencys(
  limit = 10,
  page = 1,
  search?: string,
  sortOptions?: {
    sort_id?: string;
    sort_trade_name?: string;
    sort_legal_name?: string;
    sort_cnpj?: string;
    sort_state_registration?: string;
    sort_municipal_registration?: string;
    sort_license_number?: string;
  }
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.AgencyWhereInput = {};

  if (search) {
    const normalized = search.trim();
    whereClause = {
      OR: [
        { trade_name: { contains: normalized, mode: insensitiveMode } },
        { legal_name: { contains: normalized, mode: insensitiveMode } },
        { cnpj: { contains: normalized, mode: insensitiveMode } },
        { license_number: { contains: normalized, mode: insensitiveMode } },
        ...(Number(normalized)
          ? [
              { state_registration: { equals: Number(normalized) } },
              { municipal_registration: { equals: Number(normalized) } },
            ]
          : []),
      ],
    };
  }

  const orderBy: Prisma.AgencyOrderByWithRelationInput[] = [];

  if (sortOptions?.sort_id) orderBy.push({ id: sortOptions.sort_id.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_trade_name) orderBy.push({ trade_name: sortOptions.sort_trade_name.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_legal_name) orderBy.push({ legal_name: sortOptions.sort_legal_name.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_cnpj) orderBy.push({ cnpj: sortOptions.sort_cnpj.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_state_registration) orderBy.push({ state_registration: sortOptions.sort_state_registration.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_municipal_registration) orderBy.push({ municipal_registration: sortOptions.sort_municipal_registration.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_license_number) orderBy.push({ license_number: sortOptions.sort_license_number.toLowerCase() === "desc" ? "desc" : "asc" });

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  try {
    const [data, count] = await Promise.all([
      prisma.agency.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
        select: {
          id: true,
          trade_name: true,
          legal_name: true,
          cnpj: true,
          state_registration: true,
          municipal_registration: true,
          license_number: true,
          addresses: { include: { address: true } },
          contacts: { include: { contact: true } },
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.agency.count({ where: whereClause }),
    ]);

    return {
      data: data || [],
      count: count || 0,
      totalPages: count ? Math.ceil(count / take) : 0,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erro no getAgencies:", error);
    throw new Error("Erro ao buscar agencies.");
  }
}


export async function getAgencysById(id: number) {
  return await prisma.agency.findUnique({
    where: { id },
    include: {
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



export async function createAgencys(data: any) {
    return await prisma.$transaction(async (tx) => {
        const agency = await tx.agency.create({
        data: {
            trade_name: data.trade_name,
            legal_name: data.legal_name,
            cnpj: data.cnpj,
            state_registration: +data.state_registration,
            municipal_registration: +data.municipal_registration,
            license_number: data.license_number,
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

            await tx.agencyContact.create({
                data: {
                contact_id: createdContact.id,
                agency_id: agency.id,
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

            await tx.agencyAddress.create({
                data: {
                address_id: createdAddress.id,
                agency_id: agency.id,
                },
            });
        }

        return agency;
    })
}
  
export async function deleteAgencys(id: number) {
  return await prisma.$transaction(async (tx) => {
    await tx.agencyAddress.deleteMany({ where: { agency_id: id } });
    await tx.agencyContact.deleteMany({ where: { agency_id: id } });

    return await tx.agency.delete({ where: { id } });
  });
}

export async function updateAgency(id: number, data: any) {
  return await prisma.$transaction(async (tx) => {
    const updatedAgency = await tx.agency.update({
      where: { id },
      data: {
        trade_name: data.trade_name,
        legal_name: data.legal_name,
        cnpj: data.cnpj,
        state_registration: +data.state_registration,
        municipal_registration: +data.municipal_registration,
        license_number: data.license_number,
      },
    });

    if (data.contacts) {
      await tx.agencyContact.deleteMany({ where: { agency_id: id } });

      for (const contact of data.contacts) {
        const createdContact = await tx.contact.create({
          data: {
            contact: contact.contact,
            telephone: contact.telephone,
            phone: contact.phone,
            email: contact.email,
            whatsapp: false,
          },
        });

        await tx.agencyContact.create({
          data: {
            contact_id: createdContact.id,
            agency_id: id,
          },
        });
      }
    }

    if (data.addresses) {
      await tx.agencyAddress.deleteMany({ where: { agency_id: id } });

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

        await tx.agencyAddress.create({
          data: {
            address_id: createdAddress.id,
            agency_id: id,
          },
        });
      }
    }

    return updatedAgency;
  });
}
