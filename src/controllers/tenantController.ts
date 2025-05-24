import { Request, Response } from "express";
import { createTenants, getTenants } from "../models/tenant";

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
}