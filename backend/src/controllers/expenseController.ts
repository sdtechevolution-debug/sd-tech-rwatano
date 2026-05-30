import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

export const getExpenses = async (req: AuthRequest, res: Response) => {
  const expenses = await prisma.expense.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  res.json(expenses);
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  const { category, description, amount } = req.body;
  if (!category || amount == null) {
    return res.status(400).json({ message: "Category and amount are required" });
  }
  const expense = await prisma.expense.create({
    data: {
      userId: req.user!.id,
      category,
      description,
      amount: Number(amount),
    },
  });
  res.status(201).json(expense);
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { category, description, amount } = req.body;
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      category: category ?? expense.category,
      description: description ?? expense.description,
      amount: amount != null ? Number(amount) : expense.amount,
    },
  });
  res.json(updated);
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  await prisma.expense.delete({ where: { id } });
  res.json({ message: "Expense deleted" });
};
