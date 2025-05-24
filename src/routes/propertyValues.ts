import express from "express";
import { PropertyValuesController } from "../controllers/propertyValuesController";

const router = express.Router();

router.get("/property-values", PropertyValuesController.getPropertyValues);
router.post("/property-values", PropertyValuesController.createPropertyValues);

export default router;
