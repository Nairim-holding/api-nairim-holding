import { Request, Response } from "express";
import { createAgencys, deleteAgencys, getAgencys, getAgencysById, updateAgency } from "../models/agency";

export class AgencyController {

    static async getAgency(req: Request, res: Response) {
                const limit = parseInt(req.query.limit as string) || 10;
                const page = parseInt(req.query.page as string) || 1;
                const search = req.query.search as string;
        
                try {
                    const agencys = await getAgencys(limit, page, search);
                    res.status(200).json(agencys);
                } catch (error) {
                    res.status(500).json({ message: 'Internal server error' });
                }
            }
<<<<<<< HEAD

    static async getAgencysById(req: Request, res: Response) {
        const { id } = req.params;
        try {
          const agencys = await getAgencysById(+id);
          res.status(200).json(agencys);
        } catch (error) {
          res.status(500);
        }
      }
=======
>>>>>>> 95af1e3668b3a617bc7d1981eeeebe381d704676

    static async createAgency(req: Request, res: Response) {
        try {
            const create = await createAgencys(req.body);
            res.status(200).json({ status: 200, message: `A ${create.legal_name} foi criada com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar agência" });
        }
    }

    static async updateAgency(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const updated = await updateAgency(Number(id), req.body);
            res.status(200).json({ status: 200,message: `A agência ${updated.legal_name} foi atualizada com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar agência" });
        }
    }

    static async deleteAgency(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await deleteAgencys(Number(id));
            res.status(200).json({ status: 200,message: `Agência com ID ${id} foi deletada com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar agência" });
        }
    }
}
