import { Request, Response } from "express";
import { 
    createLease, 
    getLeases, 
    getLeaseById, 
    updateLease, 
    deleteLeases 
} from "../models/lease";

export class LeaseController {

    static async getLeases(req: Request, res: Response) {
        const limit = parseInt(req.query.limit as string) || 10;
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || "";
        const includeInactive = req.query.includeInactive === "true";

        const sortOptions: Record<string, string> = {};
        Object.entries(req.query).forEach(([key, value]) => {
            if (key.startsWith("sort_") && typeof value === "string" && value.length > 0) {
                sortOptions[key] = value;
            }
        });

        try {
            const leases = await getLeases(limit, page, search, sortOptions, includeInactive);
            res.status(200).json(leases);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getLeaseById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const lease = await getLeaseById(+id);
            res.status(200).json(lease);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao buscar locação" });
        }
    }

    static async createLease(req: Request, res: Response) {
        try {
            const lease = await createLease(req.body);
            res.status(200).json({
                status: 200,
                message: `Locação criada com sucesso!`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: `Erro ao criar locação: ${error}` });
        }
    }

    static async updateLease(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const lease = await updateLease(Number(id), req.body);
            res.status(200).json({
                status: 200,
                message: `Locação ${lease.contract_number} atualizada com sucesso!`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: `Erro ao atualizar locação: ${error}` });
        }
    }

    static async deleteLease(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const lease = await getLeaseById(+id);
            await deleteLeases(Number(id));
            res.status(200).json({
                status: 200,
                message: `Locação desativada com sucesso.`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao desativar locação" });
        }
    }
}
