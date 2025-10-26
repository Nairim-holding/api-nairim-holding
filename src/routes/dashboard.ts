import express from "express";
import { DashboardController } from "../controllers/dashboard";

const router = express.Router();

router.get("/dashboard", DashboardController.getMetrics);

export default router;
