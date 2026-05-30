import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createDebt, getDebts, addDebtPayment, updateDebt, deleteDebt } from "../controllers/debtController";

const router = Router();
router.get("/", authenticate, getDebts);
router.post("/", authenticate, authorize(["OWNER", "WORKER"]), createDebt);
router.post("/:id/payments", authenticate, authorize(["OWNER", "WORKER"]), addDebtPayment);
router.put("/:id", authenticate, authorize(["OWNER"]), updateDebt);
router.delete("/:id", authenticate, authorize(["OWNER"]), deleteDebt);

export default router;
