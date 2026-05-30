import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from "../controllers/productController";

const router = Router();
router.get("/", authenticate, getProducts);
router.get("/:id", authenticate, getProduct);
router.post("/", authenticate, authorize(["OWNER", "WORKER"]), createProduct);
router.put("/:id", authenticate, authorize(["OWNER", "WORKER"]), updateProduct);
router.delete("/:id", authenticate, authorize(["OWNER"]), deleteProduct);

export default router;
