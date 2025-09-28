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
    const sortOptions = {
      sort_id: req.query.sort_id as string,
      sort_trade_name: req.query.sort_trade_name as string,
      sort_legal_name: req.query.sort_legal_name as string,
      sort_cnpj: req.query.sort_cnpj as string,
      sort_state_registration: req.query.sort_state_registration as string,
      sort_municipal_registration: req.query.sort_municipal_registration as string,
      sort_license_number: req.query.sort_license_number as string,
    };
    const includeInactive = req.query.includeInactive === "true";
    try {
      const agencys = await getAgencys(limit, page, search, sortOptions, includeInactive);
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
