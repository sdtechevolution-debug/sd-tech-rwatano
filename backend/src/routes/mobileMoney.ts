import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createMobileMoneyTransaction, getMobileMoneyTransactions } from "../controllers/mobileMoneyController";

const router = Router();
router.get("/", authenticate, getMobileMoneyTransactions);
router.post("/", authenticate, authorize(["OWNER", "WORKER"]), createMobileMoneyTransaction);

export default router;
