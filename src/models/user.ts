import prisma from "../../prisma/client";
import { Prisma, Gender, Role } from "@prisma/client";

export async function getUsers(
  limit = 10,
  page = 1,
  search?: string,
  sortOptions?: { [key: string]: string },
  includeInactive = false,
  filters?: Record<string, string | number | boolean>
) {
  const insensitiveMode: Prisma.QueryMode = "insensitive";
  let whereClause: Prisma.UserWhereInput = includeInactive ? {} : { is_active: true };

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === "") return;

      if (["name", "email"].includes(key)) {
        (whereClause as any)[key] = { contains: String(value), mode: insensitiveMode };
      } 
      else if (key === "birth_date") {
        const date = new Date(value as string);
        (whereClause as any)[key] = { equals: date };
      }
      else if (key === "gender" && Object.values(Gender).includes(value as Gender)) {
        (whereClause as any)[key] = { equals: value as Gender };
      }
      else if (key === "role" && Object.values(Role).includes(value as Role)) {
        (whereClause as any)[key] = { equals: value as Role };
      }
      else if (["id"].includes(key)) {
        (whereClause as any)[key] = Number(value);
      } 
      else if (key === "is_active") {
        (whereClause as any)[key] = value === "true";
      } 
      else {
        (whereClause as any)[key] = { contains: String(value), mode: insensitiveMode };
      }
    });
  }

  if (search) {
    const normalized = search.toUpperCase().trim();
    const orFilters: Prisma.UserWhereInput["OR"] = [
      { name: { contains: normalized, mode: insensitiveMode } },
      { email: { contains: normalized, mode: insensitiveMode } },
    ];

    if (Object.values(Gender).includes(normalized as Gender))
      orFilters.push({ gender: { equals: normalized as Gender } });
    if (Object.values(Role).includes(normalized as Role))
      orFilters.push({ role: { equals: normalized as Role } });

    whereClause = { AND: [whereClause], OR: orFilters };
  }

  const orderBy: Prisma.UserOrderByWithRelationInput[] = [];
  for (const [key, direction] of Object.entries(sortOptions || {})) {
    if (direction)
      orderBy.push({ [key.replace("sort_", "")]: direction.toLowerCase() === "desc" ? "desc" : "asc" });
  }

  const take = limit > 0 ? limit : 10;
  const skip = (page - 1) * take;

  const [data, count] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy.length > 0 ? orderBy : [{ id: "asc" }],
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
    data,
    count,
    totalPages: Math.ceil(count / take),
    currentPage: page,
  };
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
  return await prisma.user.update({
    where: { id },
    data: { is_active: false },
  });
}

export async function updateUser(id: number, data: any) {
    return await prisma.user.update({
        where: { id },
        data
    });
}
const fieldLabels: Record<string, string> = {
  id: "ID",
  name: "Nome",
  email: "E-mail",
  birth_date: "Data de Nascimento",
  gender: "Gênero",
  role: "Função",
  is_active: "Ativo",
  created_at: "Criado em",
  updated_at: "Atualizado em",
};

const genderLabels: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Usuário",
  BARBEIRO: "Barbeiro",
};

const booleanLabels: Record<string, string> = {
  true: "Ativo",
  false: "Inativo",
};

export async function getUserFilterOptions() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      gender: true,
      is_active: true,
      birth_date: true,
    },
  });

  const unique = <T, K extends keyof T>(arr: T[], key: K) =>
    [...new Set(arr.map((i) => i[key]).filter(Boolean))];

  const ids = unique(users, "id");
  const names = unique(users, "name");
  const emails = unique(users, "email");
  const genders = unique(users, "gender");
  const roles = unique(users, "role");
  const birthDates = unique(users, "birth_date");

  const filters = [
    {
      field: "id",
      label: fieldLabels.id,
      type: "number",
      inputType: "number",
      options: ids.map((v) => ({ value: v, label: v })),
    },
    {
      field: "name",
      label: fieldLabels.name,
      type: "string",
      inputType: "text",
      options: names.map((v) => ({ value: v, label: v })),
    },
    {
      field: "email",
      label: fieldLabels.email,
      type: "string",
      inputType: "text",
      options: emails.map((v) => ({ value: v, label: v })),
    },
    {
      field: "gender",
      label: fieldLabels.gender,
      type: "enum",
      inputType: "select",
      options: genders.map((g) => ({
        value: g,
        label: genderLabels[g] || g,
      })),
    },
    {
      field: "role",
      label: fieldLabels.role,
      type: "enum",
      inputType: "select",
      options: roles.map((r) => ({
        value: r,
        label: roleLabels[r] || r,
      })),
    },
    {
      field: "is_active",
      label: fieldLabels.is_active,
      type: "boolean",
      inputType: "select",
      options: [
        { value: "true", label: booleanLabels["true"] },
        { value: "false", label: booleanLabels["false"] },
      ],
    },
    {
      field: "birth_date",
      label: fieldLabels.birth_date,
      type: "date",
      inputType: "date",
      options: birthDates.map((d) => ({
        value: d.toISOString(),
        label: new Date(d).toLocaleDateString("pt-BR"),
      })),
    },
  ];

  return filters;
}