import prisma from "../../prisma/client";
import { Prisma, LeaseStatus } from "@prisma/client";

export async function getLeases(
  limit = 10,
  page = 1,
  search?: string,
  sortOptions?: { sort_id?: string; sort_contract_number?: string; sort_start_date?: string; sort_end_date?: string; sort_rent_amount?: string },
  includeInactive = false
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.LeaseWhereInput = includeInactive
    ? {} 
    : { is_active: true };

  if (search) {
    const searchNumber = parseInt(search);
    const orFilters: Prisma.LeaseWhereInput["OR"] = [];

    if (!isNaN(searchNumber)) {
      orFilters.push({ contract_number: searchNumber });
    }

    if (Object.values(LeaseStatus).includes(search as LeaseStatus)) {
      orFilters.push({ status: search as LeaseStatus });
    }

    whereClause = { AND: [whereClause], OR: orFilters };
  }

  const orderBy: Prisma.LeaseOrderByWithRelationInput[] = [];
  if (sortOptions?.sort_id) orderBy.push({ id: sortOptions.sort_id.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_contract_number) orderBy.push({ contract_number: sortOptions.sort_contract_number.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_start_date) orderBy.push({ start_date: sortOptions.sort_start_date.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_end_date) orderBy.push({ end_date: sortOptions.sort_end_date.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_rent_amount) orderBy.push({ rent_amount: sortOptions.sort_rent_amount.toLowerCase() === "desc" ? "desc" : "asc" });

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  const [data, count] = await Promise.all([
    prisma.lease.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
    }),
    prisma.lease.count({ where: whereClause }),
  ]);

  return {
    data,
    count,
    totalPages: count ? Math.ceil(count / take) : 0,
    currentPage: page,
  };
}

export async function getLeaseById(id: number) {
  return await prisma.lease.findUnique({ where: { id } });
}

export async function createLease(data: any) {
  return await prisma.lease.create({ data });
}

export async function updateLease(id: number, data: any) {
  return await prisma.lease.update({ where: { id }, data });
}

export async function deleteLeases(id: number) {
  return await prisma.lease.update({
    where: { id },
    data: { is_active: false }, 
  });
}
