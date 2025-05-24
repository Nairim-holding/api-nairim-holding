import { Request, Response } from "express";
import { createAgencys, getAgencys } from "../models/agency";
export class AgencyController {

    static async getAgency (req: Request, res: Response){
        try{
            const agencys = await getAgencys();
            res.status(200).json(agencys);
        } catch (error){
            res.status(500);
        }
    }

    static async createAgency (req: Request , res: Response) {
        try{
            const create = await createAgencys( req.body );
            res.status(200).json({ status: 200, message: `A  ${(await create).legal_name} foi criado com sucesso!` });
        } catch (error) {
            res.status(500)
        }
    }
}