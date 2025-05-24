import { Request, Response } from "express";
import { createLeases, getLeases } from "../models/lease";

export class LeaseController {

    static async getLease (req: Request, res: Response){
        try{
            const leases = await getLeases();
            res.status(200).json(leases);
        } catch (error){
            res.status(500);
        }
    }

    static async createLease (req: Request , res: Response) {
        try{
            const create = await createLeases( req.body );
            res.status(200).json({ status: 200, message: `O locação adicionado com sucesso!` });
        } catch (error) {
            res.status(500)
        }
    }
}