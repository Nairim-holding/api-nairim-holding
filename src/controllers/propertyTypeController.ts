import { Request, Response } from "express";
import { getPropertys } from "../models/property";
import { createPropertysType } from "../models/propertyType";

export class PropertyTypeController {

    static async getPropertyType (req: Request, res: Response){
        try{
            const propertysType = await getPropertys();
            res.status(200).json(propertysType);
        } catch (error){
            res.status(500);
        }
    }

    static async createPropertyType (req: Request , res: Response) {
        try{
            const create = await createPropertysType( req.body );
            res.status(200).json({ status: 200, message: `O tipo de imovel foi adicionado com sucesso!` });
        } catch (error) {
            res.status(500)
        }
    }
}