import { Request, Response } from "express";
import { createPropertys, deletePropertys, getPropertys, updatePropertys } from "../models/property";
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

    static async updateProperty(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const updated = await updatePropertys(Number(id), req.body);
            res.status(200).json({ status: 200,message: `O imovel ${updated.title} foi atualizado com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar imovel" });
        }
    }

    static async deleteProperty(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await deletePropertys(Number(id));
            res.status(200).json({ status: 200, message: `Imovel com ID ${id} foi deletado com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: `Erro ao deletar imovel ${error}` });
        }
    }
}