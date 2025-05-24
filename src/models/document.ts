import prisma from "../../prisma/client";

export async function getDocuments(){
    return await prisma.document.findMany();
}

export async function createDocuments(data: any) {
    const documents = await prisma.document.create({
        data
    });
    return documents;
}
  
export async function deleteDocuments(id: number){
    return await prisma.document.delete({where: { id: id}});
}