import prisma from "../../prisma/client";

export async function getContacts(){
    return await prisma.contact.findMany();
}

export async function createContacts(data: any) {
    const contact = await prisma.contact.create({
        data
    });
    return contact;
}
  
export async function deleteContacts(id: number){
    return await prisma.contact.delete({where: { id: id}});
}