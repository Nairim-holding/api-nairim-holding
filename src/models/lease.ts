import prisma from "../../prisma/client";
import { Prisma, LeaseStatus } from "@prisma/client";

export async function getLeases(
  limit = 10,
  page = 1,
  search?: string,
  sortOptions?: { 
    sort_id?: string;
    sort_contract?: string;
    sort_status?: string;
    sort_start_date?: string;
    sort_end_date?: string;
    sort_rent_amount?: string;
  },
  includeInactive = false
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.LeaseWhereInput = includeInactive ? {} : { is_active: true };

  if (search) {
    const normalized = search.toUpperCase().trim();

    const orFilters: Prisma.LeaseWhereInput["OR"] = [
      { owner: { name: { contains: normalized, mode: insensitiveMode } } },
      { tenant: { name: { contains: normalized, mode: insensitiveMode } } },
      { property: { title: { contains: normalized, mode: insensitiveMode } } },
      { status: { equals: normalized as any } }, // caso busque por status
    ];

    if (!isNaN(Number(search))) {
      orFilters.push({ contract_number: Number(search) });
    }

    whereClause = { AND: [whereClause], OR: orFilters };
  }

  const orderBy: Prisma.LeaseOrderByWithRelationInput[] = [];
  if (sortOptions?.sort_id) orderBy.push({ id: sortOptions.sort_id.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_contract) orderBy.push({ contract_number: sortOptions.sort_contract.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_status) orderBy.push({ status: sortOptions.sort_status.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_start_date) orderBy.push({ start_date: sortOptions.sort_start_date.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_end_date) orderBy.push({ end_date: sortOptions.sort_end_date.toLowerCase() === "desc" ? "desc" : "asc" });
  if (sortOptions?.sort_rent_amount) orderBy.push({ rent_amount: sortOptions.sort_rent_amount.toLowerCase() === "desc" ? "desc" : "asc" });

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  try {
    const [data, count] = await Promise.all([
      prisma.lease.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
        select: {
          id: true,
          contract_number: true,
          start_date: true,
          end_date: true,
          status: true,
          rent_amount: true,
          condo_fee: true,
          property_tax: true,
          extra_charges: true,
          agency_commission: true,
          commission_amount: true,
          rent_due_date: true,
          tax_due_date: true,
          condo_due_date: true,
          is_active: true,
          property: { select: { id: true, title: true, type: { select: { description: true } } } },
          owner: { select: { id: true, name: true } },
          tenant: { select: { id: true, name: true } },
        }
      }),
      prisma.lease.count({ where: whereClause }),
    ]);

    return {
      data: data || [],
      count: count || 0,
      totalPages: count ? Math.ceil(count / take) : 0,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erro no getLeases:", error);
    throw new Error("Erro ao buscar contratos de locação.");
  }
}


export async function getLeaseById(id: number) {
  return prisma.lease.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          type: true,
          documents: true,
          addresses: { include: { address: true } },
          owner: true,
          values: true,
        }
      },
      owner: {
        include: {
          addresses: { include: { address: true } },
          contacts: { include: { contact: true } }
        }
      },
      tenant: {
        include: {
          addresses: { include: { address: true } },
          contacts: { include: { contact: true } }
        }
      },
      type: true
    }
  });
}

export async function createLease(data: any) {
  return await prisma.lease.create({
    data: {
      ...data,
      property_id: Number(data.property_id),
      type_id: Number(data.type_id),
      owner_id: Number(data.owner_id),
      tenant_id: Number(data.tenant_id),
      contract_number: Number(data.contract_number),
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      rent_due_date: new Date(data.rent_due_date),
      tax_due_date: new Date(data.tax_due_date),
      condo_due_date: new Date(data.condo_due_date),
    },
  });
}

export async function updateLease(id: number, data: any) {
  return await prisma.lease.update({ where: { id },     data: {
      ...data,
      property_id: Number(data.property_id),
      type_id: Number(data.type_id),
      owner_id: Number(data.owner_id),
      tenant_id: Number(data.tenant_id),
      contract_number: Number(data.contract_number),
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      rent_due_date: new Date(data.rent_due_date),
      tax_due_date: new Date(data.tax_due_date),
      condo_due_date: new Date(data.condo_due_date),
    }, });
}

export async function deleteLeases(id: number) {
  return await prisma.lease.update({
    where: { id },
    data: { is_active: false }, 
  });
}
