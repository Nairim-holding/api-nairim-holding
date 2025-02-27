import prisma from "../../prisma/client";

export async function getUsers(){
    return await prisma.user.findMany();
}

export async function getUsersByEmail(email: string){
    return await prisma.user.findUnique({ where: { email: email }});
}

export async function getUserById(id: number) {
    return await prisma.user.findUnique({ where: { id: id }});
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