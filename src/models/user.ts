import prisma from "../../prisma/client";
import { Prisma, Gender, Role } from "@prisma/client";

export async function getUsers(limit = 10, page = 1, search?: string) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";

  let whereClause: Prisma.UserWhereInput = {};

  if (search) {
    const normalized = search.toUpperCase().trim();
    const orFilters: Prisma.UserWhereInput["OR"] = [
      { name: { contains: search, mode: insensitiveMode } },
      { email: { contains: search, mode: insensitiveMode } },
    ];

    if (Object.values(Gender).includes(normalized as Gender)) {
      orFilters.push({ gender: { equals: normalized as Gender } });
    }

    if (Object.values(Role).includes(normalized as Role)) {
      orFilters.push({ role: { equals: normalized as Role } });
    }

    whereClause = { OR: orFilters };
  }

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  try {
    const [data, count] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          birth_date: true,
          gender: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: data || [],
      count: count || 0,
      totalPages: count ? Math.ceil(count / take) : 0,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erro no getUsers:", error);
    throw new Error("Erro ao buscar usuários.");
  }
}


export async function getUsersByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email: email }
    });
}

export async function getUserById(id: number) {
    return await prisma.user.findUnique({
        where: { id: id }
    });
}

export async function createUsers(data: any) {
    const user = await prisma.user.create({
        data
    });
    return user;
}

export async function deleteUsers(id: number) {
    return await prisma.user.delete({
        where: { id: id }
    });
}

export async function updateUser(id: number, data: any) {
    return await prisma.user.update({
        where: { id },
        data
    });
}