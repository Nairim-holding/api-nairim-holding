import express from "express";
import { TenantController } from "../controllers/tenantController";

const router = express.Router();

router.get("/tenant", TenantController.getTenant);
router.post("/tenant", TenantController.createTenant);
router.get("/tenant/:id", TenantController.getTenantsById);
router.delete("/tenant/:id", TenantController.deleteTenant);
router.put("/tenant/:id", TenantController.updateTenant);


export default router;
