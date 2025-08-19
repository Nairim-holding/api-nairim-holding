import express from "express";
import { OwnerController } from "../controllers/ownerController";

const router = express.Router();

router.get("/owner", OwnerController.getOwner);
router.post("/owner", OwnerController.createOwner);
router.get("/owner/:id", OwnerController.getOwnerById);
router.delete("/owner/:id", OwnerController.deleteOwners);
router.put("/owner/:id", OwnerController.updateOwner)

export default router;
