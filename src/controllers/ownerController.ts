import { Request, Response } from "express";
import { createOwners, deleteOwners, getOwnerById, getOwners, updateOwner } from "../models/owner";

export class OwnerController {

    static async getOwner (req: Request, res: Response){
        try{
            const owners = await getOwners();
            res.status(200).json(owners);
        } catch (error){
            res.status(500);
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

    static async createOwner (req: Request , res: Response) {
        try{
            const create = await createOwners( req.body );
            res.status(200).json({ status: 200, message: `O proprietario ${(await create).name} foi adicionado com sucesso!` });
        } catch (error) {
            res.status(500)
        }
    }

    
    static async updateOwner(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const updated = await updateOwner(Number(id), req.body);
            res.status(200).json({ status: 200,message: `O proprietario ${updated.name} foi atualizada com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar proprietario" });
        }
    }

    static async deleteOwners (req: Request , res: Response) {
        const { id } = req.params;
        try {
            await deleteOwners(Number(id));
            res.status(200).json({ status: 200,message: `Proprietario com ID ${id} foi deletado com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar proprietario" });
        }
    }
}