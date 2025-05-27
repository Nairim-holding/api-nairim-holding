import { Request, Response } from "express";
import { createUsers, getUsers, updateUser, deleteUsers } from "../models/user";
import bcrypt from 'bcrypt';

export class UserController {

    static async getUser(req: Request, res: Response) {
        try {
            const users = await getUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: "Erro interno ao buscar usuários." });
        }
    }

    static async createUser(req: Request, res: Response) {
        const { name, email, password, birth_date, gender } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const data = { name, email, password: hashedPassword, birth_date, gender };
            const create = await createUsers(data);
            res.status(200).json({ status: 200, message: `O usuário ${create.name} foi criado com sucesso!` });
        } catch (error) {
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

        try {
            await deleteUsers(Number(id));
            res.status(200).json({ status: 200, message: `Usuário com ID ${id} deletado com sucesso.` });
        } catch (error) {
            res.status(500).json({ error: `Erro ao deletar usuário: ${error}` });
        }
    }
}
