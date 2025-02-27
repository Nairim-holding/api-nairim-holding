import { Request, Response } from "express";
import { getUsersByEmail } from "../models/user";

import jwt from 'jsonwebtoken';

export class AuthenticateController {

    static async login(req: Request, res: Response): Promise<any> {
        const { email, password } = req.body as { email: string; password: string };

        try {
            if (!email || !password) {
                return res.status(400).json({ status: 400, message: 'Todos os campos devem ser preenchidos.' });
            }

            const user = await getUsersByEmail(email);

            if( !user?.email ){
                return res.status(400).json({ status: 400, message: 'Por favor insira um email já cadastrado.' });
            }

            if( user?.password != password ){
                return res.status(400).json({ status: 400, message: 'Senha incorreta.' });
            }
           
            
            const secretKey = process.env.JWT_SECRET_KEY as string;
            const payload = { name: user.name, email: user.email, role: 'administrador' };
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

            return res.status(200).json({ status: 200, message: `Login realizado com sucesso!`, token });

        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Erro ao realizar o login.' });
        }
    }
}
