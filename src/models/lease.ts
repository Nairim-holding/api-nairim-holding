import prisma from "../../prisma/client";

export async function getLeases(){
    return await prisma.lease.findMany();
}

export async function createLeases(data: any) {
    const leases = await prisma.lease.create({
        data
    });
    return leases;
}
  
export async function deleteLeases(id: number){
    return await prisma.lease.delete({where: { id: id}});
}