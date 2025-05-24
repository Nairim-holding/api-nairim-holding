import prisma from "../../prisma/client";

export async function getTenants(){
    return await prisma.tenant.findMany();
}

export async function createTenants(data: any) {
    const tenant = await prisma.tenant.create({
        data
    });
    return tenant;
}
  
export async function deleteTenants(id: number){
    return await prisma.tenant.delete({where: { id: id}});
}