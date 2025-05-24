import prisma from "../../prisma/client";

export async function getOwnersContact(){
    return await prisma.ownerContact.findMany();
}

export async function createOwnersContact(data: any) {
    const ownersContact = await prisma.ownerContact.create({
        data
    });
    return ownersContact;
}
  
export async function deleteOwnersContact(id: number){
    return await prisma.ownerContact.delete({where: { id: id}});
}