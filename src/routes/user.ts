import express from "express";
import { getUsers } from "../models/user";
import { UserController } from "../controllers/user";

const router = express.Router();

router.get("/users", UserController.getUser);
router.post("/users", UserController.createUser);

export default router;
