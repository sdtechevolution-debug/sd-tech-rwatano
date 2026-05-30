import { Router } from "express";
import { login, register, changePassword, requestPasswordReset, performPasswordReset } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.post("/login", login);
router.post("/register", register);
router.post("/change-password", authenticate, changePassword);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", performPasswordReset);

export default router;
