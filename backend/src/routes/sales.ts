import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createSale, getSales, getSale, updateSale, deleteSale } from "../controllers/salesController";

const router = Router();
router.get("/", authenticate, getSales);
router.get("/:id", authenticate, getSale);
router.post("/", authenticate, authorize(["OWNER", "WORKER"]), createSale);
router.put("/:id", authenticate, authorize(["OWNER"]), updateSale);
router.delete("/:id", authenticate, authorize(["OWNER"]), deleteSale);

export default router;
