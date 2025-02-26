import prisma from "../../prisma/client";

export async function getUsers(){
    return await prisma.user.findMany();
}

export async function createUsers(data: any) {
    const user = await prisma.user.create({
        data
    });
    return user;
  }
  

export async function deleteUsers(id: number){
    return await prisma.user.delete({where: { id: id}});
}