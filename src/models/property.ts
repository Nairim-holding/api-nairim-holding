import prisma from "../../prisma/client";

export async function getPropertys() {
    return prisma.property.findMany();
}

export async function createPropertys(data: any) {
    const property = await prisma.property.create({
        data
    });
    return property;
}
  
export async function deletePropertys(id: number){
    return await prisma.property.delete({where: { id: id}});
}