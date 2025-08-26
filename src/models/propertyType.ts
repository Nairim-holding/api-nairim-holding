import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";

export async function getPropertysType(limit = 10, page = 1, search?: string) {
    const insensitiveMode: Prisma.QueryMode = "insensitive";
    
    let whereClause: Prisma.PropertyTypeWhereInput = {};

    if (search) {
        const orFilters: Prisma.PropertyTypeWhereInput["OR"] = [];

        const searchNumber = Number(search);
        if (!isNaN(searchNumber)) {
            orFilters.push({ id: searchNumber })
        }

        orFilters.push({
            description: {
                contains: search,
                mode: insensitiveMode,
            },
        });

        whereClause = { OR: orFilters };
    }
    const take = limit > 0 ? limit : 10;
    const skip = (page - 1) * take;
    try {
        const [data, count] = await Promise.all([
        prisma.propertyType.findMany({
            where: whereClause,
            skip,
            take,
            select: {
                id: true,
                description: true,
            },
        }),
        prisma.propertyType.count({ where: whereClause }),
        ]);

        return {
        data: data || [],
        count: count || 0,
        totalPages: count ? Math.ceil(count / take) : 0,
        currentPage: page,
        };
    } catch (error) {
        console.error("Erro ao pegar os tipos de imóveis:", error);
        throw new Error("Erro ao buscar tipos de imóveis.");
    }
}

export async function getPropertyTypeById(id: number) {
    return await prisma.propertyType.findUnique({
        where: { id: id }
    });
}

export async function createPropertysType(data: any) {
    const propertyType = await prisma.propertyType.create({
        data: {
            description: data.description
        }
    });
    return propertyType;
}

export async function updatePropertyType(id: number, data: any) {
    return await prisma.propertyType.update({
        where: { id },
        data
    });
}

export async function deletePropertysType(id: number){
    return await prisma.propertyType.delete({where: { id: id}});
}