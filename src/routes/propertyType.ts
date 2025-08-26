import express from "express";
import { PropertyTypeController } from "../controllers/propertyTypeController";

const router = express.Router();

router.get("/property-type", PropertyTypeController.getPropertyType);
router.get("/property-type/:id", PropertyTypeController.getPropertyTypeById);
router.post("/property-type", PropertyTypeController.createPropertyType);
router.put("/property-type/:id", PropertyTypeController.updatePropertyType);
router.delete("/property-type/:id", PropertyTypeController.deletePropertyType);

export default router;
