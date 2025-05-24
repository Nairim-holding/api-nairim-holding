import prisma from "../../prisma/client";

export async function getPropertysType() {
    return prisma.propertyType.findMany();
}

export async function createPropertysType(data: any) {
    const propertyType = await prisma.propertyType.create({
        data
    });
    return propertyType;
}
  
export async function deletePropertysType(id: number){
    return await prisma.propertyType.delete({where: { id: id}});
}