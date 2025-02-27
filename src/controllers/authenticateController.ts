import { Request, Response } from "express";
import { getUsersByEmail } from "../models/user";

export class AuthenticateController {

    static async login(req: Request, res: Response): Promise<any> {
        const { email, password } = req.body as { email: string; password: string };

        try {
            if (!email || !password) {
                return res.status(400).json({ status: 400, message: 'Todos os campos devem ser preenchidos.' });
            }

            const userEmail = await getUsersByEmail(email);

            if( !userEmail?.email ){
                return res.status(400).json({ status: 400, message: 'Por favor insira um email já cadastrado.' });
            }

            if( userEmail.password != password ){
                return res.status(400).json({ status: 400, message: 'Senha incorreta.' });
            }

            return res.status(200).json({ status: 200, message: `Login realizado com sucesso! ${userEmail?.email}` });

        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Erro ao realizar o login.' });
        }
    }
}
