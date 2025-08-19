import prisma from "../../prisma/client";
import { Prisma } from "@prisma/client";

export async function getAgencys(limit = 10, page = 1, search?: string) {
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
        // Se o search for um número, tenta bater com state_registration e municipal_registration
        ...(Number(normalized)
          ? [
              { state_registration: { equals: Number(normalized) } },
              { municipal_registration: { equals: Number(normalized) } },
            ]
          : []),
      ],
    };
  }

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  try {
    const [data, count] = await Promise.all([
      prisma.agency.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          trade_name: true,
          legal_name: true,
          cnpj: true,
          state_registration: true,
          municipal_registration: true,
          license_number: true,
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
<<<<<<< HEAD
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



=======
}


>>>>>>> 95af1e3668b3a617bc7d1981eeeebe381d704676
export async function createAgencys(data: any) {
    return await prisma.$transaction(async (tx) => {
        const agency = await tx.agency.create({
        data: {
            trade_name: data.trade_name,
            legal_name: data.legal_name,
            cnpj: data.cnpj,
            state_registration: data.state_registration,
            municipal_registration: data.municipal_registration,
            license_number: data.license_number,
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
                number: address.number,
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
        state_registration: data.state_registration,
        municipal_registration: data.municipal_registration,
        license_number: data.license_number,
      },
    });

    if (data.contacts) {
      await tx.agencyContact.deleteMany({ where: { agency_id: id } });

      for (const contact of data.contacts) {
        const createdContact = await tx.contact.create({
          data: {
            phone: contact.phone,
            email: contact.email,
            whatsapp: contact.whatsapp,
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
            number: address.number,
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
