import prisma from "../../prisma/client";

export async function getFavorites(){
    return await prisma.favorite.findMany();
}

export async function createFavorites(data: any) {
    const favorites = await prisma.favorite.create({
        data
    });
    return favorites;
}
  
export async function deleteFavorites(id: number){
    return await prisma.favorite.delete({where: { id: id}});
}