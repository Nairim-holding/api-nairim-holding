import express from "express";
import { LeaseController } from "../controllers/leaseController";
import { FavoriteController } from "../controllers/favoriteController";

const router = express.Router();

router.get("/favorite", FavoriteController.getFavorite);

export default router;
