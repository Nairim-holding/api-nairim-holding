import prisma from "../../prisma/client";

export async function getAddress(){
    return await prisma.address.findMany();
}

export async function createAddress(data: any) {
    const address = await prisma.address.create({
        data
    });
    return address;
}
  
export async function deleteAddress(id: number){
    return await prisma.address.delete({where: { id: id}});
}