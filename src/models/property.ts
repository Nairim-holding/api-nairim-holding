import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import verifyDate from "../utils/verifyDate";
import fs from "fs";
import path from "path";
import deleteFolderRecursive from "../utils/deleteDirectory";

export async function getPropertys(
  limit = 10,
  page = 1,
  search?: string,
  sortOptions?: Record<string, string>
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  const whereClause: Prisma.PropertyWhereInput = search
    ? {
        OR: [
          { title: { contains: search, mode: insensitiveMode } },
          { tax_registration: { contains: search, mode: insensitiveMode } },
          { notes: { contains: search, mode: insensitiveMode } },
          { owner: { is: { name: { contains: search, mode: insensitiveMode } } } },
          { type: { is: { description: { contains: search, mode: insensitiveMode } } } },
        ],
      }
    : {};

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [];

  if (sortOptions) {
    Object.entries(sortOptions).forEach(([key, value]) => {
      if (!value) return;
      const order = value.toLowerCase() === "desc" ? "desc" : "asc";

      switch (key) {
        case "sort_id":
          orderBy.push({ id: order });
          break;
        case "sort_title":
          orderBy.push({ title: order });
          break;
        case "sort_owner":
          orderBy.push({ owner: { name: order } });
          break;
        case "sort_type":
          orderBy.push({ type: { description: order } });
          break;
        case "sort_bedrooms":
        case "sort_bathrooms":
        case "sort_half_bathrooms":
        case "sort_garage_spaces":
        case "sort_area_total":
        case "sort_area_built":
        case "sort_frontage":
        case "sort_floor_number":
        case "sort_furnished":
          orderBy.push({ [key.replace("sort_", "")]: order } as any);
          break;
        case "sort_tax_registration":
          orderBy.push({ tax_registration: order });
          break;
        case "sort_notes":
          orderBy.push({ notes: order });
          break;
      }
    });
  }

  const [data, count] = await Promise.all([
    prisma.property.findMany({
      where: whereClause,
      include: {
        addresses: { include: { address: true } },
        owner: true,
        type: true,
        documents: true,
        values: true,
      },
      skip,
      take,
      orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
    }),
    prisma.property.count({ where: whereClause }),
  ]);

  const addrKeys = ["zip_code", "street", "district", "city", "state"];
  if (sortOptions) {
    addrKeys.forEach((key) => {
      const sortKey = `sort_${key}`;
      if (sortOptions[sortKey]) {
        const order = sortOptions[sortKey].toLowerCase() === "desc" ? -1 : 1;
        data.sort((a, b) => {
          const aVal = a.addresses?.[0]?.address[key as keyof typeof a.addresses[0]["address"]];
          const bVal = b.addresses?.[0]?.address[key as keyof typeof b.addresses[0]["address"]];
          if (aVal == bVal) return 0;
          return aVal > bVal ? order : -order;
        });
      }
    });
  }

  return {
    data,
    count,
    totalPages: count ? Math.ceil(count / take) : 0,
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
