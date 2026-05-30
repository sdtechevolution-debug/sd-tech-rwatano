import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

const defaultServiceCategories = [
  "PRINTING",
  "PHOTOCOPY",
  "SCANNING",
  "TYPING",
  "INTERNET",
  "MOBILE_MONEY",
  "AIRTIME_SIM",
];

export const getServices = async (req: AuthRequest, res: Response) => {
  const services = await prisma.service.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  res.json(services);
};

export const getServiceCategories = async (req: AuthRequest, res: Response) => {
  const savedCategories = await prisma.service.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  const categories = Array.from(
    new Set([
      ...defaultServiceCategories,
      ...savedCategories.map((row) => row.category),
    ])
  );

  res.json(categories);
};

export const createService = async (req: AuthRequest, res: Response) => {
  const { category, description, amount, paymentMethod, amountPaid, customerName, customerPhone } = req.body;
  if (!category || amount == null) {
    return res.status(400).json({ message: "Category and amount are required" });
  }

  const paidAmount = amountPaid !== undefined && amountPaid !== null && String(amountPaid).trim() !== "" ? Number(amountPaid) : Number(amount);
  if (Number.isNaN(paidAmount) || paidAmount < 0 || paidAmount > Number(amount)) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }

  const remainingAmount = Number(amount) - paidAmount;
  if (remainingAmount > 0 && (!customerName || !customerPhone)) {
    return res.status(400).json({ message: "Customer name and phone are required for debt services" });
  }

  const service = await prisma.service.create({
    data: {
      userId: req.user!.id,
      category,
      description,
      paymentMethod: paymentMethod || "CASH",
      isDebt: remainingAmount > 0,
      amount: Number(amount),
      paidAmount,
      remainingAmount,
    },
  });

  if (remainingAmount > 0) {
    await prisma.debt.create({
      data: {
        userId: req.user!.id,
        customerName,
        customerPhone,
        totalOwed: remainingAmount,
        paidAmount: 0,
        remainingAmount,
        status: paidAmount > 0 ? "PARTIAL" : "OPEN",
      },
    });
  }
  res.status(201).json(service);
};

export const updateService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { category, description, amount, paymentMethod } = req.body;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return res.status(404).json({ message: "Service not found" });

  if (amount != null && Number(amount) !== service.amount) {
    return res.status(400).json({ message: "Service amount cannot be changed after creation." });
  }

  const updated = await prisma.service.update({
    where: { id },
    data: {
      category: category ?? service.category,
      description: description ?? service.description,
      paymentMethod: paymentMethod ?? service.paymentMethod,
    },
  });
  res.json(updated);
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return res.status(404).json({ message: "Service not found" });
  if (service.isDebt) return res.status(400).json({ message: "Cannot delete a service with outstanding debt" });
  await prisma.service.delete({ where: { id } });
  res.json({ message: "Service deleted" });
};
