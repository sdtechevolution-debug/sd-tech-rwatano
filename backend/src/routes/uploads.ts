import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middleware/auth";
import { uploadProductImage } from "../controllers/uploadController";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();
router.post("/product", authenticate, authorize(["OWNER", "WORKER"]), upload.single("file"), uploadProductImage);

export default router;
