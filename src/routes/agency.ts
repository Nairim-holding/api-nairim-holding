import express from "express";
import { AgencyController } from "../controllers/agencyController";

const router = express.Router();

router.get("/agency", AgencyController.getAgency);
router.post("/agency", AgencyController.createAgency);

export default router;
