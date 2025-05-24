import prisma from "../../prisma/client";

export async function getAgencys() {
    return prisma.agency.findMany();
}

export async function createAgencys(data: any) {
    const agency = await prisma.agency.create({
        data
    });
    return agency;
}
  
export async function deleteAgencys(id: number){
    return await prisma.agency.delete({where: { id: id}});
}