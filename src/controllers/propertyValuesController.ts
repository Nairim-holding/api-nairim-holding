import { Request, Response } from "express";
import { createPropertysValue, getPropertysValue } from "../models/propertyValue";

export class PropertyValuesController {

    static async getPropertyValues (req: Request, res: Response){
        try{
            const propertysValues = await getPropertysValue();
            res.status(200).json(propertysValues);
        } catch (error){
            res.status(500);
        }
    }

    static async createPropertyValues (req: Request , res: Response) {
        try{
            const create = await createPropertysValue( req.body );
            res.status(200).json({ status: 200, message: `O valor do imovel ${(await create).name} foi adicionado com sucesso!` });
        } catch (error) {
            res.status(500)
        }
    }
}