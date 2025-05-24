import prisma from "../../prisma/client";

export async function getTenantsContact(){
    return await prisma.tenantContact.findMany();
}

export async function createTenantsContact(data: any) {
    const tenantContact = await prisma.tenantContact.create({
        data
    });
    return tenantContact;
}
  
export async function deleteTenantsContact(id: number){
    return await prisma.tenantContact.delete({where: { id: id}});
}