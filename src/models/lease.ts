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

export async function getLeasesById(id: number) {
  return await prisma.lease.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          addresses: { include: { address: true } },
          documents: true,
          values: true,
          type: true,
          owner: true,
        },
      },
      type: true,
      owner: true,
      tenant: true,
    },
  });
}

  
export async function deleteLeases(id: number){
    return await prisma.lease.delete({where: { id: id}});
}