import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createExpense, getExpenses, updateExpense, deleteExpense } from "../controllers/expenseController";

const router = Router();
router.get("/", authenticate, getExpenses);
router.post("/", authenticate, authorize(["OWNER", "WORKER"]), createExpense);
router.put("/:id", authenticate, authorize(["OWNER"]), updateExpense);
router.delete("/:id", authenticate, authorize(["OWNER"]), deleteExpense);

export default router;
