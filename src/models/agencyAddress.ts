import prisma from "../../prisma/client";

export async function getAgencyAddress(){
    return await prisma.agencyAddress.findMany();
}

export async function createAgencyAddress(data: any) {
    const agencyAddress = await prisma.agencyAddress.create({
        data
    });
    return agencyAddress;
}
  
export async function deleteAgencyAddress(id: number){
    return await prisma.agencyAddress.delete({where: { id: id}});
}