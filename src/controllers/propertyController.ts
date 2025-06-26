import { Request, Response } from "express";
import { createPropertys, deletePropertys, getPropertyById, getPropertys, updatePropertys } from "../models/property";
import { Prisma } from "@prisma/client";
export class PropertyController {
  static async getProperty(req: Request, res: Response) {
    const limit = req.query.limit as string;
    const search = req.query.search as string;
    try {
      const agencys = await getPropertys(limit, search);
      res.status(200).json(agencys);
    } catch (error) {
      res.status(500);
    }
  }

  static async getPropertyById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const agency = await getPropertyById(+id);
      res.status(200).json(agency);
    } catch (error) {
      res.status(500);
    }
  }

  static async createProperty(req: Request, res: Response): Promise<any> {
    try {
      const create = await createPropertys(req.body);
      res
        .status(200)
        .json({
          status: 200,
          message: `O imóvel ${(await create).title} foi criado com sucesso!`,
        });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            return res.status(409).json({
              status: 409,
              message:
                "Já existe um imóvel com um dos dados únicos informados.",
            });

          case "P2003":
            return res.status(400).json({
              status: 400,
              message:
                "Referência inválida: verifique se o proprietário e o tipo de imóvel existem.",
            });

          case "P2025":
            return res.status(404).json({
              status: 404,
              message: "Recurso relacionado não encontrado.",
            });

          default:
            return res.status(400).json({
              status: 400,
              message: `Erro ao processar a solicitação (código: ${error.code}).`,
            });
        }
      }
        return res.status(500).json({
            status: 500,
            message: 'Erro interno ao criar o imóvel. Tente novamente mais tarde.'
        });
    }
  }

  static async updateProperty(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const updated = await updatePropertys(Number(id), req.body);
      res
        .status(200)
        .json({
          status: 200,
          message: `O imovel ${updated.title} foi atualizado com sucesso!`,
        });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar imovel" });
    }
  }

  static async deleteProperty(req: Request, res: Response) {
    const { id } = req.params;
    const propertyById = await getPropertyById(+id);
    try {
      await deletePropertys(Number(id));
      res
        .status(200)
        .json({
          status: 200,
          message: `Imovel ${propertyById?.title} foi deletado com sucesso.`,
        });
    } catch (error) {
      res.status(500).json({ error: `Erro ao deletar imovel ${error}` });
    }
  }
}