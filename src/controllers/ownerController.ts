import { Request, Response } from "express";
import { createOwners, deleteOwners, getOwnerById, getOwners, updateOwner } from "../models/owner";

export class OwnerController {

    static async getOwner(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;
    const includeInactive = req.query.includeInactive === "true";

    const sortOptions = {
        sort_id: req.query.sort_id as string,
        sort_name: req.query.sort_name as string,
        sort_internal_code: req.query.sort_internal_code as string,
        sort_occupation: req.query.sort_occupation as string,
        sort_marital_status: req.query.sort_marital_status as string,
        sort_cnpj: req.query.sort_cnpj as string,
        sort_cpf: req.query.sort_cpf as string,
        sort_state_registration: req.query.sort_state_registration as string,
        sort_municipal_registration: req.query.sort_municipal_registration as string,
        sort_zip_code: req.query.sort_zip_code as string,
        sort_state: req.query.sort_state as string,
        sort_city: req.query.sort_city as string,
        sort_district: req.query.sort_district as string,
        sort_address: req.query.sort_address as string,
        sort_contact: req.query.sort_contact as string,
        sort_telephone: req.query.sort_telephone as string,
        sort_phone: req.query.sort_phone as string,
        sort_email: req.query.sort_email as string,
    };

    try {
        const owners = await getOwners(limit, page, search, sortOptions, includeInactive);
        res.status(200).json(owners);
    } catch (error) {
        console.error("Erro ao buscar proprietários:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    }

    static async getOwnerById(req: Request, res: Response) {
        const { id } = req.params;
        try {
          const owner = await getOwnerById(+id);
          res.status(200).json(owner);
        } catch (error) {
          res.status(500);
        }
      }

    static async createOwner(req: Request, res: Response) {
        try {
            const create = await createOwners(req.body);
            res.status(200).json({
            status: 200,
            message: `O proprietário ${create.name} foi adicionado com sucesso!`,
            });
        } catch (error) {
            console.error("Erro ao criar proprietário:", error);
            res.status(500).json({ message: "Erro interno ao criar proprietário." });
        }
    }

    
    static async updateOwner(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const updated = await updateOwner(Number(id), req.body);
            res.status(200).json({ status: 200,message: `O proprietario ${updated.name} foi atualizado com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar proprietario" });
        }
    }

    static async deleteOwners (req: Request , res: Response) {
        const { id } = req.params;
        const ownerById = await getOwnerById(+id);
        try {
            await deleteOwners(Number(id));
            res.status(200).json({ status: 200,message: `Proprietario ${ownerById?.name} foi deletado com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar proprietario" });
        }
    }
}