import { Request, Response } from "express";

export class AuthenticateController {

    static async login(req: Request, res: Response){
        const {email, password} = req.body as { email: string; password: string};
        try{

            if(!email || !password) {
                res.send(400).json({status: 400, message: 'Todos os campos devem ser preenchidos.'});
            }



        } catch (error) {
            res.send(400).json({ status: 400, message: 'Ocorreu um erro ao fazer o login.' })
        }
    }

}