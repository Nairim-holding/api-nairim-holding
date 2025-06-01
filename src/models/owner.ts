import prisma from "../../prisma/client";

export async function getOwners(){
    return await prisma.owner.findMany({ 
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

export async function createOwners(data: any) {
    return await prisma.$transaction(async (tx) => {
        const owner = await tx.owner.create({ 
            data: {
                name: data.name,
                internal_code: data.internal_code,
                occupation: data.occupation,            
                marital_status: data.marital_status,
                cnpj: data.cnpj,
                cpf: data.cpf,   
                state_registration: data.state_registration, 
                municipal_registration : data.municipal_registration
            }
        });

        for (const contact of data.contacts ?? []) {
            const createdContact = await tx.contact.create({
                data: {
                    phone: contact.phone,
                    email: contact.email,
                    whatsapp: contact.whatsapp,
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
                    number: address.number,
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
    })
}
  
export async function deleteOwners(id: number){
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
        internal_code: data.internal_code,
        occupation: data.occupation,
        marital_status: data.marital_status,
        cnpj: data.cnpj,
        cpf: data.cpf,
        state_registration: data.state_registration,
        municipal_registration: data.municipal_registration,
      },
    });

    if (data.contacts) {
      await tx.ownerContact.deleteMany({ where: { owner_id: id } });

      for (const contact of data.contacts) {
        const createdContact = await tx.contact.create({
          data: {
            phone: contact.phone,
            email: contact.email,
            whatsapp: contact.whatsapp,
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
            number: address.number,
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