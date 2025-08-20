import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import verifyDate from "../utils/verifyDate";
import fs from "fs";
import path from "path";
import deleteFolderRecursive from "../utils/deleteDirectory";

export async function getPropertys(limit = 10, page = 1, search?: string) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  const whereClause = search
    ? {
        OR: [
          { title: { contains: search, mode: insensitiveMode } },
          { tax_registration: { contains: search, mode: insensitiveMode } },
          { notes: { contains: search, mode: insensitiveMode } },
          {
            type: {
              is: {
                description: { contains: search, mode: insensitiveMode },
              },
            },
          },
          {
            owner: {
              is: {
                name: { contains: search, mode: insensitiveMode },
                occupation: { contains: search, mode: insensitiveMode },
                marital_status: { contains: search, mode: insensitiveMode },
                cnpj: { contains: search, mode: insensitiveMode },
                cpf: { contains: search, mode: insensitiveMode },
              },
            },
          },
          {
            addresses: {
              some: {
                address: {
                  OR: [
                    { zip_code: { contains: search, mode: insensitiveMode } },
                    { street: { contains: search, mode: insensitiveMode } },
                    { district: { contains: search, mode: insensitiveMode } },
                    { city: { contains: search, mode: insensitiveMode } },
                    { state: { contains: search, mode: insensitiveMode } },
                    { country: { contains: search, mode: insensitiveMode } },
                  ],
                },
              },
            },
          },
        ],
      }
    : {};

  const skip = (page - 1) * limit;

  const data = await prisma.property.findMany({
    where: whereClause,
    include: {
      values: true,
      addresses: {
        include: {
          address: true,
        },
      },
      owner: true,
      type: true,
      documents: true,
    },
    skip,
    take: limit,
  });

  const count = await prisma.property.count({ where: whereClause });

  return {
    data,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  };
}

export async function getPropertyById(id: number) {
  return await prisma.property.findUnique({
    where: { id: id },
    include: {
      values: true,
      addresses: {
        include: {
          address: true,
        },
      },
      owner: true,
      type: true,
      documents: true
    },
  });
}

export async function createPropertys(data: any) {
  try {
    return await prisma.$transaction(async (tx) => {
      const parsed = JSON.parse(data.dataPropertys);
      const parsedAddress = JSON.parse(data.addressProperty);
      const parsedValuesProperty = JSON.parse(data.valuesProperty);

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
        type_id,
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
        furnished: parsed.furnished == "true",
      };

      const { zip_code, street, number, district, city, state, country } = {
        ...parsedAddress,
        number: +parsedAddress.number,
      };

      const {
        sale_rules,
        lease_rules,
        purchase_value,
        purchase_date,
        property_tax,
        rental_value,
        condo_fee,
        current_status,
        sale_value,
        sale_date,
        extra_charges,
      } = {
        ...parsedValuesProperty,
        purchase_value: parseFloat(parsedValuesProperty.purchase_value),
        sale_value: parseFloat(parsedValuesProperty.sale_value) || 0,
        rental_value: parseFloat(parsedValuesProperty.rental_value),
        property_tax: parseFloat(parsedValuesProperty.property_tax),
        condo_fee: parseFloat(parsedValuesProperty.condo_fee),
        extra_charges: parseFloat(parsedValuesProperty.extra_charges) || 0,
        sale_date: verifyDate(parsedValuesProperty.sale_date),
        purchase_date: verifyDate(parsedValuesProperty.purchase_date),
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
          notes: parsed.notes,
        },
      });

      if (parsedAddress) {
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

      if (!purchase_date) {
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
            rental_value,
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
    const documents = await tx.document.findMany({
      where: { property_id: id },
    });

    const propertyFolder = path.join(__dirname, "..", "..", "uploads", id.toString());
    deleteFolderRecursive(propertyFolder);

    await tx.document.deleteMany({ where: { property_id: id } });
    await tx.propertyAddress.deleteMany({ where: { property_id: id } });
    await tx.favorite.deleteMany({ where: { property_id: id } });
    await tx.lease.deleteMany({ where: { property_id: id } });
    await tx.propertyValue.deleteMany({ where: { property_id: id } });

    await tx.property.delete({ where: { id } });
  });
}

export async function updatePropertys(id: number, data: any) {
  try {
    return await prisma.$transaction(async (tx) => {
      const parsed = JSON.parse(data.dataPropertys);
      const parsedAddress = JSON.parse(data.addressProperty);
      const parsedValuesProperty = JSON.parse(data.valuesProperty);

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
        type_id,
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
        furnished: parsed.furnished === "true",
      };

      const { zip_code, street, number, district, city, state, country } = {
        ...parsedAddress,
        number: +parsedAddress.number,
      };

      const {
        sale_rules,
        lease_rules,
        purchase_value,
        purchase_date,
        property_tax,
        rental_value,
        condo_fee,
        current_status,
        sale_value,
        sale_date,
        extra_charges,
      } = {
        ...parsedValuesProperty,
        purchase_value: parseFloat(parsedValuesProperty.purchase_value),
        sale_value: parseFloat(parsedValuesProperty.sale_value),
        rental_value: parseFloat(parsedValuesProperty.rental_value),
        property_tax: parseFloat(parsedValuesProperty.property_tax),
        condo_fee: parseFloat(parsedValuesProperty.condo_fee),
        extra_charges: parseFloat(parsedValuesProperty.extra_charges),
        sale_date: verifyDate(parsedValuesProperty.sale_date),
        purchase_date: verifyDate(parsedValuesProperty.purchase_date),
      };

      // if (!sale_date || !purchase_date) {
      //   throw new Error("Datas inválidas fornecidas. Verifique novamente!");
      // }

      const updatedProperty = await tx.property.update({
        where: { id },
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
          notes: parsed.notes,
        },
      });

      if (parsedAddress) {
        await tx.propertyAddress.deleteMany({ where: { property_id: id } });

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
            property_id: id,
          },
        });
      }

      if (parsedValuesProperty) {
        await tx.propertyValue.deleteMany({ where: { property_id: id } });

        const total = rental_value + property_tax + condo_fee + extra_charges;

        await tx.propertyValue.createMany({
          data: {
            property_id: id,
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
            rental_value,
          },
        });
      }

      return updatedProperty;
    });
  } catch (error) {
    console.error("Erro ao atualizar propriedade:", error);
    throw error;
  }
}
