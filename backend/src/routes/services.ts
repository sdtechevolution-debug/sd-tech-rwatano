import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createService, getServiceCategories, getServices, updateService, deleteService } from "../controllers/serviceController";

const router = Router();
router.get("/categories", authenticate, getServiceCategories);
router.get("/", authenticate, getServices);
router.post("/", authenticate, authorize(["OWNER", "WORKER"]), createService);
router.put("/:id", authenticate, authorize(["OWNER"]), updateService);
router.delete("/:id", authenticate, authorize(["OWNER"]), deleteService);

export default router;
