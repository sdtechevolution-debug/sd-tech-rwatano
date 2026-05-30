import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getCategories, createCategory } from "../controllers/categoryController";

const router = Router();
router.get("/", authenticate, getCategories);
router.post("/", authenticate, createCategory);

export default router;
