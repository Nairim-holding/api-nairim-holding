import prisma from "../../prisma/client";

export async function getPropertys() {
    return prisma.property.findMany({
        include: {
            values: true,
            addresses: {
                include: {
                    address: true
                }
            }
        }
    });
}

export async function getPropertyById(id: number) {
    return await prisma.property.findUnique({ where: { id: id }});
}

export async function createPropertys(data: any) {
  try {
    return await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          owner_id: data.owner_id,
          type_id: data.type_id,
          title: data.title,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          half_bathrooms: data.half_bathrooms,
          garage_spaces: data.garage_spaces,
          area_total: data.area_total,
          area_built: data.area_built,
          frontage: data.frontage,
          furnished: data.furnished,
          floor_number: data.floor_number,
          tax_registration: data.tax_registration,
          notes: data.notes
        },
      });

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

        await tx.propertyAddress.create({
          data: {
            address_id: createdAddress.id,
            property_id: property.id,
          },
        });
      }

      if (data.values && data.values.length > 0) {
        const valuesToCreate = data.values.map((value: any) => ({
            name: value.name,
            purchase_value: value.purchase_value,
            purchase_date: value.purchase_date ? new Date(value.purchase_date) : null,
            sale_value: value.sale_value,
            sale_date: value.sale_date ? new Date(value.sale_date) : null,
            rental_value: value.rental_value,
            property_tax: value.property_tax,
            condo_fee: value.condo_fee,
            extra_charges: value.extra_charges,
            total: value.total,
            current_status: value.current_status,
            lease_rules: value.lease_rules,
            sale_rules: value.sale_rules,
            notes: value.notes,
            property_id: property.id,
        }));

        await tx.propertyValue.createMany({
            data: valuesToCreate,
        });
      }

      return property;
    });
  } catch (error) {
    console.error("Erro ao criar propriedade:", error);
    throw error;
  }
}

export async function deletePropertys(id: number) {
  return await prisma.$transaction(async (tx) => {
    await tx.document.deleteMany({ where: { property_id: id } });
    await tx.propertyAddress.deleteMany({ where: { property_id: id } });
    await tx.favorite.deleteMany({ where: { property_id: id } });
    await tx.lease.deleteMany({ where: { property_id: id } });
    await tx.propertyValue.deleteMany({ where: { property_id: id } });

    await tx.property.delete({ where: { id } });
  });
}

export async function updatePropertys(id: number, data: any) {
  try{
  return await prisma.$transaction(async (tx) => {
    const updatedProperty = await tx.property.update({
      where: { id },
        data: {
          owner_id: data.owner_id,
          type_id: data.type_id,
          title: data.title,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          half_bathrooms: data.half_bathrooms,
          garage_spaces: data.garage_spaces,
          area_total: data.area_total,
          area_built: data.area_built,
          frontage: data.frontage,
          furnished: data.furnished,
          floor_number: data.floor_number,
          tax_registration: data.tax_registration,
          notes: data.notes
        },
    });

    if (data.addresses) {
      await tx.propertyAddress.deleteMany({ where: { property_id: id } });

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

        await tx.propertyAddress.create({
          data: {
            address_id: createdAddress.id,
            property_id: id,
          },
        });
      }
    }

    if (data.values && data.values.length > 0) {
    await tx.propertyValue.deleteMany({ where: { property_id: id } });

    const valuesToCreate = data.values.map((value: any) => ({
        property_id: id,
        name: value.name,
        purchase_value: value.purchase_value,
        purchase_date: value.purchase_date ? new Date(value.purchase_date) : null,
        sale_value: value.sale_value,
        sale_date: value.sale_date ? new Date(value.sale_date) : null,
        rental_value: value.rental_value,
        property_tax: value.property_tax,
        condo_fee: value.condo_fee,
        extra_charges: value.extra_charges,
        total: value.total,
        current_status: value.current_status,
        lease_rules: value.lease_rules,
        sale_rules: value.sale_rules,
        notes: value.notes,
    }));

    await tx.propertyValue.createMany({ data: valuesToCreate });
    }

    return updatedProperty;
  });
  } catch (error) {
    console.error("Erro ao criar propriedade:", error);
    throw error;
  }
}