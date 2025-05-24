import prisma from "../../prisma/client";

export async function getAgencysContacts(){
    return await prisma.agencyContact.findMany();
}

export async function createAgencysContacts(data: any) {
    const agencyContact = await prisma.agencyContact.create({
        data
    });
    return agencyContact;
}
  
export async function deleteAgencysContacts(id: number){
    return await prisma.agencyContact.delete({where: { id: id}});
}