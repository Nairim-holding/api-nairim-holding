import { Request, Response } from "express";
import { createUsers, getUsers } from "../models/user";
import { createFavorites, getFavorites } from "../models/favorite";

export class FavoriteController {

    static async getFavorite (req: Request, res: Response){
        try{
            const favorites = await getFavorites();
            res.status(200).json(favorites);
        } catch (error){
            res.status(500);
        }
    }
}