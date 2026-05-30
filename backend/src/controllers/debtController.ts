import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

export const getDebts = async (req: AuthRequest, res: Response) => {
  const debts = await prisma.debt.findMany({ include: { user: true, payments: true }, orderBy: { createdAt: "desc" } });
  res.json(debts);
};

export const createDebt = async (req: AuthRequest, res: Response) => {
  const { customerName, customerPhone, totalOwed, dueDate } = req.body;
  if (!customerName || !customerPhone || totalOwed == null) {
    return res.status(400).json({ message: "Customer name, phone and amount owed are required" });
  }
  if (Number(totalOwed) <= 0 || Number.isNaN(Number(totalOwed))) {
    return res.status(400).json({ message: "Total owed must be a positive number" });
  }
  const debt = await prisma.debt.create({
    data: {
      userId: req.user!.id,
      customerName,
      customerPhone,
      totalOwed: Number(totalOwed),
      remainingAmount: Number(totalOwed),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: { payments: true },
  });
  res.status(201).json(debt);
};

export const addDebtPayment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amount, note, paymentMethod } = req.body;
  if (amount == null || amount <= 0) {
    return res.status(400).json({ message: "Payment amount must be greater than zero" });
  }
  const debt = await prisma.debt.findUnique({ where: { id } });
  if (!debt) return res.status(404).json({ message: "Debt record not found" });

  const normalizedPaymentMethod = paymentMethod ? String(paymentMethod).toUpperCase() : "CASH";
  if (normalizedPaymentMethod !== "CASH" && normalizedPaymentMethod !== "MOMO") {
    return res.status(400).json({ message: "Invalid payment method. Use CASH or MOMO." });
  }
  const pm = normalizedPaymentMethod as "CASH" | "MOMO";

  if (Number(amount) > debt.remainingAmount) {
    return res.status(400).json({ message: "Payment amount exceeds remaining debt" });
  }

  const paidAmount = debt.paidAmount + Number(amount);
  const remainingAmount = debt.totalOwed - paidAmount;
  const status = remainingAmount === 0 ? "CLOSED" : "PARTIAL";

  const payment = await prisma.debtPayment.create({
    data: {
      debtId: id,
      amount: Number(amount),
      note,
      paymentMethod: pm,
    },
  });

  // If payment received via MOMO, also record a mobile money transaction so analytics picks it up
  if (pm === "MOMO") {
    await prisma.mobileMoneyTransaction.create({
      data: {
        userId: req.user!.id,
        type: "DEPOSIT",
        amount: Number(amount),
        provider: "MOMO",
        note: note || `Debt payment ${id}`,
      },
    });
  }

  const updatedDebt = await prisma.debt.update({
    where: { id },
    data: {
      paidAmount,
      remainingAmount,
      status,
    },
    include: { payments: true },
  });

  res.json({ payment, debt: updatedDebt });
};

export const updateDebt = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { customerName, customerPhone, totalOwed, dueDate } = req.body;
  const debt = await prisma.debt.findUnique({ where: { id } });
  if (!debt) return res.status(404).json({ message: "Debt record not found" });

  const newTotalOwed = totalOwed != null ? Number(totalOwed) : debt.totalOwed;
  if (newTotalOwed < 0) {
    return res.status(400).json({ message: "Total owed must be non-negative" });
  }

  const updatedRemainingAmount = totalOwed != null ? Math.max(debt.remainingAmount + (newTotalOwed - debt.totalOwed), 0) : debt.remainingAmount;
  const status = updatedRemainingAmount === 0 ? "CLOSED" : debt.paidAmount > 0 ? "PARTIAL" : "OPEN";

  if (newTotalOwed < debt.paidAmount) {
    return res.status(400).json({ message: "New total owed cannot be less than amount already paid" });
  }

  const updated = await prisma.debt.update({
    where: { id },
    data: {
      customerName: customerName ?? debt.customerName,
      customerPhone: customerPhone ?? debt.customerPhone,
      totalOwed: newTotalOwed,
      remainingAmount: updatedRemainingAmount,
      status,
      dueDate: dueDate ? new Date(dueDate) : debt.dueDate,
    },
  });

  res.json(updated);
};

export const deleteDebt = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const debt = await prisma.debt.findUnique({ where: { id } });
  if (!debt) return res.status(404).json({ message: "Debt record not found" });

  await prisma.debtPayment.deleteMany({ where: { debtId: id } });
  await prisma.debt.delete({ where: { id } });
  res.json({ message: "Debt deleted" });
};
