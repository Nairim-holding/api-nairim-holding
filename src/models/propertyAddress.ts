import prisma from "../../prisma/client";

export async function getPropertysAddress() {
    return prisma.propertyAddress.findMany();
}

export async function createPropertysAddress(data: any) {
    const propertyAddress = await prisma.propertyAddress.create({
        data
    });
    return propertyAddress;
}
  
export async function deletePropertysAddress(id: number){
    return await prisma.propertyAddress.delete({where: { id: id}});
}