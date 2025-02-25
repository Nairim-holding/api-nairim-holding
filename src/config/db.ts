import { PrismaClient } from "@prisma/client";

export default async function connectBD(prisma: PrismaClient){
    try {
      await prisma.$connect();
      console.log('Conectado ao banco de dados com sucesso!');
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
      process.exit(1);
    }
  };
  