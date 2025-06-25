import express from "express";
import { PropertyController } from "../controllers/propertyController";

const router = express.Router();

router.get("/property", PropertyController.getProperty);
router.get("/property/:id", PropertyController.getPropertyById);
router.post("/property", PropertyController.createProperty);
router.put("/property/:id", PropertyController.updateProperty)
router.delete("/property/:id", PropertyController.deleteProperty);

export default router;
