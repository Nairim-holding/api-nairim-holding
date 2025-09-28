import prisma from "../../prisma/client";
import { Prisma, LeaseStatus } from "@prisma/client";

export async function getLeases(
  limit: number,
  page: number,
  search?: string,
  sortOptions?: any,
  includeInactive?: boolean
) {
  const where: any = {};

  if (!includeInactive) {
    where.is_active = true;
  }

  if (search) {
    where.OR = [
      { contract_number: { contains: search } },
      { owner: { name: { contains: search, mode: "insensitive" } } },
      { tenant: { name: { contains: search, mode: "insensitive" } } },
      { property: { title: { contains: search, mode: "insensitive" } } }
    ];
  }

  const leases = await prisma.lease.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where,
    orderBy: {
      id: sortOptions?.sort_id || "asc"
    },
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

  const total = await prisma.lease.count({ where });

  return {
    data: leases,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit)
    }
  };
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
