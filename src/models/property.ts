import prisma from "../../prisma/client";
import verifyDate from "../utils/verifyDate";

export async function getPropertys() {
    return prisma.property.findMany({
        include: {
            values: true,
            addresses: {
                include: {
                    address: true
                }
            },
            owner: true,
            type: true
        }
    });
}

export async function getPropertyById(id: number) {
    return await prisma.property.findUnique({ where: { id: id }});
}

export async function createPropertys(data: any) {
  try {
    return await prisma.$transaction(async (tx) => {
    console.log(data)
    const parsed = JSON.parse(data.dataPropertys);
    const parsedAddress = JSON.parse(data.addressProperty);
    const parsedValuesProperty = JSON.parse(data.valuesProperty);
    // const parsedMidias = JSON.parse(data.midiasProperty);

    // console.log(data)

    const {
      title,
      bedrooms,
      bathrooms,
      half_bathrooms,
      garage_spaces,
      floor_number,
      area_total,
      area_built,
      frontage,
      tax_registration,
      furnished,
      owner_id,
      type_id
    } = {
      ...parsed,
      bedrooms: +parsed.bedrooms,
      bathrooms: +parsed.bathrooms,
      half_bathrooms: +parsed.half_bathrooms,
      garage_spaces: +parsed.garage_spaces,
      floor_number: +parsed.floor_number,
      area_total: parseFloat(parsed.area_total),
      area_built: parseFloat(parsed.area_built),
      frontage: parseFloat(parsed.frontage),
      owner_id: +parsed.owner_id,
      type_id: +parsed.type_id,
      furnished: parsed.furnished == 'true'
    };

    const { zip_code, street, number, district, city, state, country } = {...parsedAddress, number: +parsedAddress.number };

    const { sale_rules, lease_rules, purchase_value, purchase_date, property_tax, rental_value, condo_fee, current_status, sale_value, sale_date, extra_charges } = 
    {...parsedValuesProperty, purchase_value: parseFloat(parsedValuesProperty.purchase_value), sale_value: parseFloat(parsedValuesProperty.sale_value), rental_value: parseFloat(parsedValuesProperty.rental_value), property_tax: parseFloat(parsedValuesProperty.property_tax), condo_fee: parseFloat(parsedValuesProperty.condo_fee), extra_charges: parseFloat(parsedValuesProperty.extra_charges),
    sale_date: verifyDate(parsedValuesProperty.sale_date), purchase_date: verifyDate(parsedValuesProperty.purchase_date)
    };
    
      const property = await tx.property.create({
        data: {
          owner_id,
          type_id,
          title,
          bedrooms,
          bathrooms,
          half_bathrooms,
          garage_spaces,
          area_total,
          area_built,
          frontage,
          furnished,
          floor_number,
          tax_registration,
          notes: parsed.notes
        },
      });

      if(parsedAddress){
        const createdAddress = await tx.address.create({
          data: {
            zip_code,
            street,
            number,
            district,
            city,
            state,
            country,
          },
        });

        await tx.propertyAddress.create({
          data: {
            address_id: createdAddress.id,
            property_id: property.id,
          },
        });
      }
    
      if (!sale_date || !purchase_date) {
        throw new Error("Datas inválidas fornecidas. Verifique novamente!");
      }

      if (parsedValuesProperty) {
        const total = rental_value + property_tax + condo_fee + extra_charges;
        await tx.propertyValue.createMany({
          data: {
            property_id: property.id,
            total,
            sale_rules,
            sale_value,
            lease_rules, 
            purchase_value, 
            current_status,
            sale_date,
            purchase_date,
            condo_fee,
            extra_charges,
            notes: parsedValuesProperty.notes,
            property_tax,
            rental_value
          },
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