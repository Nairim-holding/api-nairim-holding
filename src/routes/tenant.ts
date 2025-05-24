import express from "express";
import { TenantController } from "../controllers/tenantController";

const router = express.Router();

router.get("/tenant", TenantController.getTenant);
router.post("/tenant", TenantController.createTenant);

export default router;
