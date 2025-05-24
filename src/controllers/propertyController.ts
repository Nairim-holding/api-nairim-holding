import { Request, Response } from "express";
import { createPropertys, getPropertys } from "../models/property";
export class PropertyController {

    static async getProperty (req: Request, res: Response){
        try{
            const agencys = await getPropertys();
            res.status(200).json(agencys);
        } catch (error){
            res.status(500);
        }
    }

    static async createProperty (req: Request , res: Response) {
        try{
            const create = await createPropertys( req.body );
            res.status(200).json({ status: 200, message: `O imovel ${(await create).title} foi criado com sucesso!` });
        } catch (error) {
            res.status(500)
        }
    }
}