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

    static async createUser(req: Request, res: Response) {
        const { name, email, password, birth_date, gender } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const data = { name, email, password: hashedPassword, birth_date: new Date(birth_date), gender };
            const create = await createUsers(data);
            res.status(200).json({ status: 200, message: `O usuário ${create.name} foi criado com sucesso!` });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: `Erro interno ao criar usuário: ${error}` });
        }
    }

    static async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const { name, email, password, birth_date, gender } = req.body;

        try {
            const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

            const data: any = { name, email, birth_date, gender };
            if (hashedPassword) data.password = hashedPassword;

            const user = await updateUser(Number(id), data);
            res.status(200).json({ status: 200, message: `Usuário ${user.name} atualizado com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: `Erro ao atualizar usuário: ${error}` });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        const userById = await getUserById(+id);
        try {
            await deleteUsers(Number(id));
            res.status(200).json({ status: 200, message: `Usuário ${userById?.name} foi deletado com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: `Erro ao deletar usuário: ${error}` });
        }
    }
}
