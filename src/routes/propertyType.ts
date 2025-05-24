import express from "express";
import { PropertyTypeController } from "../controllers/propertyTypeController";

const router = express.Router();

router.get("/property-type", PropertyTypeController.getPropertyType);
router.post("/property-type", PropertyTypeController.createPropertyType);

export default router;
