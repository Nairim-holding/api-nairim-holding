import prisma from "../../prisma/client";
import { Prisma, LeaseStatus } from "@prisma/client";

export async function getLeases(
  limit = 10,
  page = 1,
  search = "",
  sortOptions: Record<string, string> = {},
  includeInactive = false
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.LeaseWhereInput = includeInactive ? {} : { is_active: true };
  const statusPTtoEnum: Record<string, LeaseStatus> = {
    "CONTRATO VENCIDO": "EXPIRED",
    "CONTRATO VENCENDO": "EXPIRING",
    "CONTRATO EM DIA": "UP_TO_DATE",
  };
  if (search?.trim()) {
    const normalized = search.trim().toUpperCase();

    const orFilters: Prisma.LeaseWhereInput["OR"] = [
      { owner: { name: { contains: normalized, mode: insensitiveMode } } },
      { tenant: { name: { contains: normalized, mode: insensitiveMode } } },
      { property: { title: { contains: normalized, mode: insensitiveMode } } },
    ];

    if (statusPTtoEnum[normalized]) {
      orFilters.push({ status: { equals: statusPTtoEnum[normalized] } });
    }

    if (!isNaN(Number(normalized))) {
      orFilters.push({ contract_number: Number(normalized) });
    }

    whereClause = { AND: [whereClause], OR: orFilters };
  }

  const orderBy: Prisma.LeaseOrderByWithRelationInput[] = [];

  for (const [key, value] of Object.entries(sortOptions)) {
    if (!value) continue;

    const direction = value.toLowerCase() === "desc" ? "desc" : "asc";

    switch (key) {
      case "sort_id":
        orderBy.push({ id: direction });
        break;
      case "sort_contract_number":
        orderBy.push({ contract_number: direction });
        break;
      case "sort_start_date":
        orderBy.push({ start_date: direction });
        break;
      case "sort_end_date":
        orderBy.push({ end_date: direction });
        break;
      case "sort_status":
        orderBy.push({ status: direction });
        break;
      case "sort_rent_amount":
        orderBy.push({ rent_amount: direction });
        break;
      case "sort_condominium_fee":
        orderBy.push({ condo_fee: direction });
        break;
      case "sort_iptu":
        orderBy.push({ property_tax: direction });
        break;
      case "sort_extra_fees":
        orderBy.push({ extra_charges: direction });
        break;
      case "sort_commission_percent":
        orderBy.push({ agency_commission: direction });
        break;
      case "sort_commission_value":
        orderBy.push({ commission_amount: direction });
        break;
      case "sort_due_rent":
        orderBy.push({ rent_due_date: direction });
        break;
      case "sort_due_iptu":
        orderBy.push({ tax_due_date: direction });
        break;
      case "sort_due_condominium":
        orderBy.push({ condo_due_date: direction });
        break;
      case "sort_property":
        orderBy.push({ property: { title: direction } });
        break;
      case "sort_type":
        orderBy.push({ property: { type: { description: direction } } });
        break;
      case "sort_owner":
        orderBy.push({ owner: { name: direction } });
        break;
      case "sort_tenant":
        orderBy.push({ tenant: { name: direction } });
        break;
      default:
        break;
    }
  }

  if (orderBy.length === 0) {
    orderBy.push({ id: "asc" });
  }

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  try {
    const [data, count] = await Promise.all([
      prisma.lease.findMany({
        where: whereClause,
        skip,
        take,
        orderBy,
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
        },
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
      rent_due_date: data.rent_due_date ? new Date(data.rent_due_date) : null,
      tax_due_date: data.tax_due_date ? new Date(data.tax_due_date) : null,
      condo_due_date: data.condo_due_date ? new Date(data.condo_due_date) : null,
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
