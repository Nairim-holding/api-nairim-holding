import express from "express";
import { LeaseController } from "../controllers/leaseController";

const router = express.Router();

router.get("/lease", LeaseController.getLease);
router.post("/lease", LeaseController.createLease);

export default router;
