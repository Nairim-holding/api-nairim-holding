import express from "express";
import { PropertyController } from "../controllers/propertyController";

const router = express.Router();

router.get("/property", PropertyController.getProperty);
router.post("/property", PropertyController.createProperty);
router.put("/property/:id", PropertyController.updateProperty)
router.delete("/property/:id", PropertyController.deleteProperty);

export default router;
