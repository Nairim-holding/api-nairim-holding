import { Request, Response } from "express";
import {
  createAgencys,
  deleteAgencys,
  getAgencys,
  getAgencysById,
  updateAgency,
} from "../models/agency";

export class AgencyController {
  static async getAgency(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;

    try {
      const agencys = await getAgencys(limit, page, search);
      res.status(200).json(agencys);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAgencysById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const agencys = await getAgencysById(+id);
      res.status(200).json(agencys);
    } catch (error) {
      res.status(500);
    }
  }

  static async createAgency(req: Request, res: Response) {
    try {
      const create = await createAgencys(req.body);
      res
        .status(200)
        .json({
          status: 200,
          message: `Imobiliária ${create.legal_name} foi criada com sucesso!`,
        });
    } catch (error) {
      res.status(500).json({ error: `Erro ao criar Imobiliária: ${error}` });
    }
  }

  static async updateAgency(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const updated = await updateAgency(Number(id), req.body);
      res
        .status(200)
        .json({
          status: 200,
          message: `A Imobiliária ${updated.legal_name} foi atualizada com sucesso!`,
        });
    } catch (error) {
      res
        .status(500)
        .json({ error: `Erro ao atualizar Imobiliária: ${error}` });
    }
  }

  static async deleteAgency(req: Request, res: Response) {
    const { id } = req.params;
    const agencyById = await getAgencysById(+id);
    try {
      await deleteAgencys(Number(id));
      res
        .status(200)
        .json({
          status: 200,
          message: `Imobiliária ${agencyById?.legal_name} foi deletada com sucesso.`,
        });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar Imobiliária" });
    }
  }
}
