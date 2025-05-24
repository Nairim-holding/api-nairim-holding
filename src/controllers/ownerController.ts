import { Request, Response } from "express";
import { createOwners, getOwners } from "../models/owner";

export class OwnerController {

    static async getOwner (req: Request, res: Response){
        try{
            const owners = await getOwners();
            res.status(200).json(owners);
        } catch (error){
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
}