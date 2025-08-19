import { Request, Response } from "express";
import { createTenants, deleteTenant, getTenants, getTenantsById, updateTenant } from "../models/tenant";

export class TenantController {

    static async getTenant(req: Request, res: Response) {
            const limit = parseInt(req.query.limit as string) || 10;
            const page = parseInt(req.query.page as string) || 1;
            const search = req.query.search as string;
    
            try {
                const tenants = await getTenants(limit, page, search);
                res.status(200).json(tenants);
            } catch (error) {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
<<<<<<< HEAD

    static async getTenantsById(req: Request, res: Response) {
        const { id } = req.params;
        try {
          const tenant = await getTenantsById(+id);
          res.status(200).json(tenant);
        } catch (error) {
          res.status(500);
        }
      }
=======
>>>>>>> 95af1e3668b3a617bc7d1981eeeebe381d704676

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