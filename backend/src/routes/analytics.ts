import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getDashboardMetrics, getWeeklyPerformance, getTodayMetrics, getMonthlyServiceRevenue, getMonthlyReport } from "../controllers/analyticsController";

const router = Router();
router.get("/dashboard", authenticate, getDashboardMetrics);
router.get("/weekly", authenticate, getWeeklyPerformance);
router.get("/today", authenticate, getTodayMetrics);
router.get("/monthly-services", authenticate, getMonthlyServiceRevenue);
router.get("/monthly-report", authenticate, getMonthlyReport);

export default router;
