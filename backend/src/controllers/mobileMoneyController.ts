import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import { logActivity } from "../utils/activity";

export const getMobileMoneyTransactions = async (req: AuthRequest, res: Response) => {
  const transactions = await prisma.mobileMoneyTransaction.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  res.json(transactions);
};

export const createMobileMoneyTransaction = async (req: AuthRequest, res: Response) => {
  const { type, amount, commission, provider, note } = req.body;
  if (!type || amount == null || !provider) {
    return res.status(400).json({ message: "Transaction type, amount and provider are required" });
  }
  const transaction = await prisma.mobileMoneyTransaction.create({
    data: {
      userId: req.user!.id,
      type,
      amount: Number(amount),
      commission: Number(commission) || 0,
      provider,
      note,
    },
  });
  await logActivity(req.user!.id, "Created mobile money transaction", { transactionId: transaction.id });
  res.status(201).json(transaction);
};
