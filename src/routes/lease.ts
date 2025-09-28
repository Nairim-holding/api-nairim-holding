import express from "express";
import { LeaseController } from "../controllers/leaseController";

const router = express.Router();

router.get("/leases", LeaseController.getLeases);
router.get("/leases/:id", LeaseController.getLeaseById);
router.post("/leases", LeaseController.createLease);
router.put("/leases/:id", LeaseController.updateLease);
router.delete("/leases/:id", LeaseController.deleteLease);

export default router;
