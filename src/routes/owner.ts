import express from "express";
import { OwnerController } from "../controllers/ownerController";

const router = express.Router();

router.get("/owner", OwnerController.getOwner);
router.post("/owner", OwnerController.createOwner);

export default router;
