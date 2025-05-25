import prisma from "../../prisma/client";

export async function getAgencys() {
  return prisma.agency.findMany({
    include: {
      addresses: {
        include: {
          address: true
        }
      },
      contacts: {
        include: {
          contact: true
        }
      }
    }
  });
}

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
  
export async function deleteAgencys(id: number){
    return await prisma.agency.delete({where: { id: id}});
}