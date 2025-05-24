import express from "express";
import { PropertyController } from "../controllers/propertyController";

const router = express.Router();

router.get("/property", PropertyController.getProperty);
router.post("/property", PropertyController.createProperty);

export default router;
