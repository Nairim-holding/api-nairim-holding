import express from "express";
import { AgencyController } from "../controllers/agencyController";

const router = express.Router();

router.get("/agency", AgencyController.getAgency);
router.post("/agency", AgencyController.createAgency);
router.get("/agency/:id", AgencyController.getAgencysById);
router.put("/agency/:id", AgencyController.updateAgency);
router.delete("/agency/:id", AgencyController.deleteAgency);

export default router;
