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
  sortOptions?: Record<string, string>,
  includeInactive = false 
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.PropertyWhereInput = includeInactive ? {} : { is_active: true };

  if (search) {
    const normalized = search.trim();
    const orFilters: Prisma.PropertyWhereInput["OR"] = [
      { title: { contains: normalized, mode: insensitiveMode } },
      { tax_registration: { contains: normalized, mode: insensitiveMode } },
      { notes: { contains: normalized, mode: insensitiveMode } },
      { owner: { is: { name: { contains: normalized, mode: insensitiveMode } } } },
      { type: { is: { description: { contains: normalized, mode: insensitiveMode } } } },
      { agency: { is: { trade_name: { contains: normalized, mode: insensitiveMode } } } },
    ];

    whereClause = { AND: [whereClause], OR: orFilters };
  }

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
        case "sort_agency":
          orderBy.push({ agency: { trade_name: order } });
          break;
        default:
          orderBy.push({ [key.replace("sort_", "")]: order } as any);
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
        agency: true
      },
      skip,
      take,
      orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
    }),
    prisma.property.count({ where: whereClause }),
  ]);

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
      documents: true,
      agency: true
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
        agency_id,
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
        agency_id: parsed.agency_id ? +parsed.agency_id : undefined,
        furnished: parsed.furnished === "true",
      };

      const property = await tx.property.create({
        data: {
          owner_id,
          type_id,
          agency_id,
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
            zip_code: parsedAddress.zip_code,
            street: parsedAddress.street,
            number: +parsedAddress.number,
            district: parsedAddress.district,
            city: parsedAddress.city,
            state: parsedAddress.state,
            country: parsedAddress.country,
          },
        });

        await tx.propertyAddress.create({
          data: { address_id: createdAddress.id, property_id: property.id },
        });
      }

      if (parsedValuesProperty) {
        const total = parseFloat(parsedValuesProperty.rental_value) +
                      parseFloat(parsedValuesProperty.property_tax) +
                      parseFloat(parsedValuesProperty.condo_fee) +
                      (parseFloat(parsedValuesProperty.extra_charges) || 0);

        await tx.propertyValue.createMany({
          data: {
            property_id: property.id,
            total,
            sale_rules: parsedValuesProperty.sale_rules,
            sale_value: parseFloat(parsedValuesProperty.sale_value) || 0,
            lease_rules: parsedValuesProperty.lease_rules,
            purchase_value: parseFloat(parsedValuesProperty.purchase_value),
            current_status: parsedValuesProperty.current_status,
            sale_date: parsedValuesProperty.sale_date ? new Date(parsedValuesProperty.sale_date) : null,
            purchase_date: new Date(parsedValuesProperty.purchase_date),
            condo_fee: parseFloat(parsedValuesProperty.condo_fee),
            extra_charges: parseFloat(parsedValuesProperty.extra_charges) || 0,
            notes: parsedValuesProperty.notes,
            property_tax: parseFloat(parsedValuesProperty.property_tax),
            rental_value: parseFloat(parsedValuesProperty.rental_value),
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
        agency_id,
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
        agency_id: parsed.agency_id ? +parsed.agency_id : undefined,
        furnished: parsed.furnished === "true",
      };

      const updatedProperty = await tx.property.update({
        where: { id },
        data: {
          owner_id,
          type_id,
          agency_id,
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
            zip_code: parsedAddress.zip_code,
            street: parsedAddress.street,
            number: +parsedAddress.number,
            district: parsedAddress.district,
            city: parsedAddress.city,
            state: parsedAddress.state,
            country: parsedAddress.country,
          },
        });

        await tx.propertyAddress.create({
          data: { address_id: createdAddress.id, property_id: id },
        });
      }

      if (parsedValuesProperty) {
        await tx.propertyValue.deleteMany({ where: { property_id: id } });

        const total = parseFloat(parsedValuesProperty.rental_value) +
                      parseFloat(parsedValuesProperty.property_tax) +
                      parseFloat(parsedValuesProperty.condo_fee) +
                      (parseFloat(parsedValuesProperty.extra_charges) || 0);

        await tx.propertyValue.createMany({
          data: {
            property_id: id,
            total,
            sale_rules: parsedValuesProperty.sale_rules,
            sale_value: parseFloat(parsedValuesProperty.sale_value) || 0,
            lease_rules: parsedValuesProperty.lease_rules,
            purchase_value: parseFloat(parsedValuesProperty.purchase_value),
            current_status: parsedValuesProperty.current_status,
            sale_date: parsedValuesProperty.sale_date ? new Date(parsedValuesProperty.sale_date) : null,
            purchase_date: new Date(parsedValuesProperty.purchase_date),
            condo_fee: parseFloat(parsedValuesProperty.condo_fee),
            extra_charges: parseFloat(parsedValuesProperty.extra_charges) || 0,
            notes: parsedValuesProperty.notes,
            property_tax: parseFloat(parsedValuesProperty.property_tax),
            rental_value: parseFloat(parsedValuesProperty.rental_value),
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

export async function deletePropertys(id: number) {
  return await prisma.$transaction(async (tx) => {
    await tx.document.updateMany({
      where: { property_id: id, is_active: true },
      data: { is_active: false },
    });

    await tx.propertyAddress.updateMany({
      where: { property_id: id, is_active: true },
      data: { is_active: false },
    });

    await tx.favorite.updateMany({
      where: { property_id: id, is_active: true },
      data: { is_active: false },
    });

    await tx.lease.updateMany({
      where: { property_id: id, is_active: true },
      data: { is_active: false },
    });

    await tx.propertyValue.updateMany({
      where: { property_id: id, is_active: true },
      data: { is_active: false },
    });

    return await tx.property.update({
      where: { id },
      data: { is_active: false },
    });
  });
}