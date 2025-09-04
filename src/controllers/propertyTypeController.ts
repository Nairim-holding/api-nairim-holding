import { Request, Response } from "express";
import {
  createPropertysType,
  deletePropertysType,
  getPropertysType,
  getPropertyTypeById,
  updatePropertyType,
} from "../models/propertyType";

export class PropertyTypeController {
  static async getPropertyType(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;

    const sort_id = req.query.sort_id as string;
    const sort_description = req.query.sort_description as string;

    try {
      const propertysType = await getPropertysType(limit, page, search, {
      sort_id,
      sort_description,
    });
      res.status(200).json(propertysType);
    } catch (error) {
      res.status(500);
    }
  }

  static async getPropertyTypeById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const propertyType = await getPropertyTypeById(+id);
      res.status(200).json(propertyType);
    } catch (error) {
      res.status(500);
    }
  }

  static async createPropertyType(req: Request, res: Response) {
    try {
      const create = await createPropertysType(req.body);
      res.status(200).json({
        status: 200,
        message: `O tipo de imóvel foi adicionado com sucesso!`,
      });
    } catch (error) {
      res.status(500);
    }
  }

  static async updatePropertyType(req: Request, res: Response) {
    const { id } = req.params;
    const { description } = req.body;

    try {
      const data: any = {
        description
      };
      const propertyType = await updatePropertyType(Number(id), data);
      res
        .status(200)
        .json({
          status: 200,
          message: `Tipo do imóvel atualizado com sucesso.`,
        });
    } catch (error) {
      res
        .status(500)
        .json({ error: `Erro ao atualizar tipo do imóvel: ${error}` });
    }
  }

  static async deletePropertyType(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await deletePropertysType(Number(id));
      res.status(200).json({
        status: 200,
        message: `O tipo de imóvel foi deletado com sucesso.`,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: `Erro ao deletar tipo de imóvel: ${error}` });
    }
  }
}
