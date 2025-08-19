import { Request, Response } from "express";
import { createUsers, getUsers, updateUser, deleteUsers, getUserById } from "../models/user";
import bcrypt from 'bcrypt';

export class UserController {

    static async getUser(req: Request, res: Response) {
        const limit = parseInt(req.query.limit as string) || 10;
        const page = parseInt(req.query.page as string) || 1;
        const search = req.query.search as string;

        try {
            const users = await getUsers(limit, page, search);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getUserById(req: Request, res: Response) {
        const { id } = req.params;
        try {
          const user = await getUserById(+id);
          res.status(200).json(user);
        } catch (error) {
          res.status(500);
        }
    }
    

    static async createUser(req: Request, res: Response) {
        const { name, email, password, birth_date, gender } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const data = { name, email, password: hashedPassword, birth_date: new Date(birth_date), gender };
            const create = await createUsers(data);
            res.status(200).json({ status: 200, message: `O Administrador ${create.name} foi criado com sucesso!` });
        } catch (error) {
            console.log(error)
<<<<<<< HEAD
            res.status(500).json({ error: `Erro interno ao criar usuário: ${error}` });
=======
            res.status(500).json({ error: `Erro interno ao criar Administrador: ${error}` });
>>>>>>> 95af1e3668b3a617bc7d1981eeeebe381d704676
        }
    }

    static async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const { name, email, birth_date, gender } = req.body;

        try {
            const data: any = { name, email, birth_date: new Date(birth_date), gender };
            const user = await updateUser(Number(id), data);
            res.status(200).json({ status: 200, message: `Administrador ${user.name} atualizado com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: `Erro ao atualizar Administrador: ${error}` });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        const userById = await getUserById(+id);
        try {
            await deleteUsers(Number(id));
<<<<<<< HEAD
            res.status(200).json({ status: 200, message: `Usuário ${userById?.name} foi deletado com sucesso.` });
=======
            res.status(200).json({ status: 200, message: `Administrador ${userById?.name} foi deletado com sucesso.` });
>>>>>>> 95af1e3668b3a617bc7d1981eeeebe381d704676
        } catch (error) {
            res.status(500).json({ error: `Erro ao deletar Administrador: ${error}` });
        }
    }
}
