import prisma from "../../prisma/client";

export async function getOwnersAddress(){
    return await prisma.ownerAddress.findMany();
}

export async function createOwnersAddress(data: any) {
    const ownersAddress = await prisma.ownerAddress.create({
        data
    });
    return ownersAddress;
}
  
export async function deleteOwnersAddress(id: number){
    return await prisma.ownerAddress.delete({where: { id: id}});
}