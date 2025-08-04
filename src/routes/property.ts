import express from "express";
import { PropertyController } from "../controllers/propertyController";
import { upload } from "../utils/upload";

const router = express.Router();

router.get("/property", PropertyController.getProperty);
router.get("/property/:id", PropertyController.getPropertyById);
router.post("/property", PropertyController.createProperty);
router.post(
  "/property/:id/upload",
  upload.fields([
    { name: "arquivosImagens" },
    { name: "arquivosMatricula" },
    { name: "arquivosRegistro" },
    { name: "arquivosEscritura" }
  ]),
  PropertyController.createMidias
);
router.put("/property/:id", PropertyController.updateProperty)
router.delete("/property/:id", PropertyController.deleteProperty);

export default router;
