import prisma from "../../prisma/client";

export async function getPropertysValue() {
    return prisma.propertyValue.findMany();
}

export async function createPropertysValue(data: any) {
    const propertyValue = await prisma.propertyValue.create({
        data
    });
    return propertyValue;
}
  
export async function deletePropertysValue(id: number){
    return await prisma.propertyValue.delete({where: { id: id}});
}