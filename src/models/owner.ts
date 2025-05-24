import prisma from "../../prisma/client";

export async function getOwners(){
    return await prisma.owner.findMany();
}

export async function createOwners(data: any) {
    const owners = await prisma.owner.create({
        data
    });
    return owners;
}
  
export async function deleteOwners(id: number){
    return await prisma.owner.delete({where: { id: id}});
}