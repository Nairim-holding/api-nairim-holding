import { Request, Response } from "express";
import { createTenants, deleteTenant, getTenants, getTenantsById, updateTenant } from "../models/tenant";

export class TenantController {

static async getTenant(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;

  const sort_id = req.query.sort_id as string;
  const sort_name = req.query.sort_name as string;
  const sort_internal_code = req.query.sort_internal_code as string;
  const sort_occupation = req.query.sort_occupation as string;
  const sort_marital_status = req.query.sort_marital_status as string;
  const sort_cnpj = req.query.sort_cnpj as string;
  const sort_cpf = req.query.sort_cpf as string;
  const sort_state_registration = req.query.sort_state_registration as string;
  const sort_municipal_registration = req.query.sort_municipal_registration as string;

  try {
    const tenants = await getTenants(limit, page, search, {
      sort_id,
      sort_name,
      sort_internal_code,
      sort_occupation,
      sort_marital_status,
      sort_cnpj,
      sort_cpf,
      sort_state_registration,
      sort_municipal_registration,
    });

    res.status(200).json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

    static async getTenantsById(req: Request, res: Response) {
        const { id } = req.params;
        try {
          const tenant = await getTenantsById(+id);
          res.status(200).json(tenant);
        } catch (error) {
          res.status(500);
        }
      }

    static async createTenant (req: Request , res: Response) {
        try{
            const create = await createTenants( req.body );
            res.status(200).json({ status: 200, message: `O inquilino ${create.name} foi adicionado com sucesso!` });
        } catch (error) {
            console.error("Erro ao criar inquilino:", error);
            res.status(500).json({ message: "Erro interno ao criar inquilino." });
        }
    }

    static async updateTenant(req: Request, res: Response) {
            const { id } = req.params;
            try {
                const updated = await updateTenant(Number(id), req.body);
                res.status(200).json({ status: 200,message: `Inquilino ${updated.name} foi atualizado com sucesso!` });
            } catch (error) {
                res.status(500).json({ error: "Erro ao atualizar inquilino" });
            }
        }
    
        static async deleteTenant(req: Request, res: Response) {
            const { id } = req.params;
            const tenantById = await getTenantsById(+id);
            try {
                await deleteTenant(Number(id));
                res.status(200).json({ status: 200,message: `Inquilino ${tenantById?.name} foi deletado com sucesso.` });
            } catch (error) {
                res.status(500).json({ error: "Erro ao deletar inquilino" });
            }
        }
}