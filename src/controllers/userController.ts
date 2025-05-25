import { Request, Response } from "express";
import { createUsers, getUsers } from "../models/user";
import bcrypt from 'bcrypt';

export class UserController {

    static async getUser (req: Request, res: Response){
        try{
            const users = await getUsers();
            res.status(200).json(users);
        } catch (error){
            res.status(500);
        }
    }

    static async createUser (req: Request , res: Response) {
        const {name, email, password, birth_date, gender} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try{
            const data = {
                name, email, password: hashedPassword, birth_date, gender
            }
            const create = await createUsers(data);
            res.status(200).json({ status: 200, message: `O usuário ${create.name} foi criado com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: `Erro interno, ${error}` });
        }
    }
}