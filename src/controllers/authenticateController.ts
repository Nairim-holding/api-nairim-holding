import { Request, Response } from "express";
import { getUsersByEmail } from "../models/user";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export class AuthenticateController {

    static async login(req: Request, res: Response): Promise<any> {
        const { email, password } = req.body as { email: string; password: string };

        try {
            if (!email || !password) {
                return res.status(400).json({ status: 400, message: 'Todos os campos devem ser preenchidos.' });
            }

            const user = await getUsersByEmail(email);

            const passwordMatch = await bcrypt.compare(password, user?.password as string);
            if(!passwordMatch || !user?.email){
                return res.status(400).json({ status: 400, message: 'Dados de login inválidos.' });
            }
           
            const secretKey = process.env.JWT_SECRET_KEY as string;
            const payload = { id: user.id, name: user.name, email: user.email, role: 'administrador' };
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

            return res.status(200).json({ status: 200, message: `Login realizado com sucesso!`, token });

        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Erro ao realizar o login.' });
        }
    }

    static async verifyToken(req: Request, res: Response): Promise<any> {
        const { token } = req.body;

        if (!token) 
            return res.status(400).json({ status: 400, message: 'Token vazio.' });
        

        try {
            jwt.verify(token, process.env.JWT_SECRET_KEY as string);

            return res.status(202).json({ status: 202, message: 'Token valido' });
        } catch (error) {
            return res.status(401).json({ status: 401, message: 'Token invalido' });
        }
    }

    static async logout(req: Request, res: Response): Promise<any> {
        res.clearCookie('token'); 
        return res.status(200).json({ status: 200, message: 'Logout realizado com sucesso.' });
    }
}
