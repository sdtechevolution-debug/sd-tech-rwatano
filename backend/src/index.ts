import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "express-async-errors";
import { json, urlencoded } from "express";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import productRoutes from "./routes/products";
import salesRoutes from "./routes/sales";
import expenseRoutes from "./routes/expenses";
import debtRoutes from "./routes/debts";
import serviceRoutes from "./routes/services";
import mobileMoneyRoutes from "./routes/mobileMoney";
import uploadRoutes from "./routes/uploads";
import analyticsRoutes from "./routes/analytics";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan("dev"));
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", uploadRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/mobile-money", mobileMoneyRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
