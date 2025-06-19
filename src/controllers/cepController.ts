import { Request, Response } from 'express';

export class CepController {
  static async getCep(req: Request, res: Response): Promise<any> {
    const originalCep = req.params.cep;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${originalCep}/json/`);

      if (!response.ok) {
        return res.status(500).json({ error: 'Erro ao buscar o CEP na API externa' });
      }

      const data: any = await response.json();

      if (data.erro) {
        return res.status(404).json({ error: 'CEP não encontrado' });
      }

      data.cep = '00000-000'; // Modifica o campo

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao buscar CEP' });
    }
  }
}
