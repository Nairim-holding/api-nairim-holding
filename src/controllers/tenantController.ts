import { Request, Response } from "express";
import { createTenants, deleteTenant, getTenants, updateTenant } from "../models/tenant";

export class TenantController {

    static async getTenant (req: Request, res: Response){
        try{
            const tenants = await getTenants();
            res.status(200).json(tenants);
        } catch (error){
            res.status(500);
        }
    }

    static async createTenant (req: Request , res: Response) {
        try{
            const create = await createTenants( req.body );
            res.status(200).json({ status: 200, message: `O inquilino ${(await create).name} foi adicionado com sucesso!` });
        } catch (error) {
            res.status(500)
        }
    }

    static async updateTenant(req: Request, res: Response) {
            const { id } = req.params;
            try {
                const updated = await updateTenant(Number(id), req.body);
                res.status(200).json({ status: 200,message: `A agência ${updated.name} foi atualizada com sucesso!` });
            } catch (error) {
                res.status(500).json({ error: "Erro ao atualizar agência" });
            }
        }
    
        static async deleteTenant(req: Request, res: Response) {
            const { id } = req.params;
            try {
                await deleteTenant(Number(id));
                res.status(200).json({ status: 200,message: `Agência com ID ${id} foi deletada com sucesso.` });
            } catch (error) {
                res.status(500).json({ error: "Erro ao deletar agência" });
            }
        }
}