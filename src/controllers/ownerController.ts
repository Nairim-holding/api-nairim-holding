import { Request, Response } from "express";
import { createOwners, deleteOwners, getOwnerById, getOwners, updateOwner } from "../models/owner";

export class OwnerController {

    static async getOwner(req: Request, res: Response) {
        const limit = parseInt(req.query.limit as string) || 10;
        const page = parseInt(req.query.page as string) || 1;
        const search = req.query.search as string;

        try {
            const owners = await getOwners(limit, page, search);
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