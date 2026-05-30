import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

export const getSales = async (req: Request, res: Response) => {
  const sales = await prisma.sale.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(sales);
};

export const getSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, user: true },
  });
  if (!sale) return res.status(404).json({ message: "Sale not found" });
  res.json(sale);
};

export const createSale = async (req: AuthRequest, res: Response) => {
  const { customerName, customerPhone, items, taxAmount, paymentMethod, amountPaid } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Sale items are required" });
  }

  const saleItems = await Promise.all(
    items.map(async (item: any) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error("Product not found");
      if (product.stockQuantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      const profit = (Number(item.unitPrice) - product.buyPrice) * item.quantity;
      return {
        productId: product.id,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        costPrice: product.buyPrice,
        profit,
      };
    })
  );

  const totalAmount = saleItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalProfit = saleItems.reduce((sum, item) => sum + item.profit, 0);
  const paidAmount = amountPaid !== undefined && amountPaid !== null && String(amountPaid).trim() !== "" ? Number(amountPaid) : totalAmount;
  if (Number.isNaN(paidAmount) || paidAmount < 0 || paidAmount > totalAmount) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }
  const remainingAmount = totalAmount - paidAmount;
  if (remainingAmount > 0 && (!customerName || !customerPhone)) {
    return res.status(400).json({ message: "Customer name and phone are required for debt sales" });
  }
  const sale = await prisma.sale.create({
    data: {
      userId: req.user!.id,
      customerName,
      customerPhone,
      paymentMethod: paymentMethod || "CASH",
      isDebt: remainingAmount > 0,
      paidAmount,
      remainingAmount,
      totalAmount,
      totalProfit,
      taxAmount: Number(taxAmount) || 0,
      items: { create: saleItems },
    },
    include: { items: true },
  });

  if (remainingAmount > 0) {
    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: "Customer name and phone are required for debt sales" });
    }
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

  await Promise.all(
    saleItems.map((item) => prisma.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { decrement: item.quantity } },
    }))
  );

  res.status(201).json(sale);
};

export const updateSale = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { customerName, customerPhone, paymentMethod, taxAmount } = req.body;

  const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) return res.status(404).json({ message: "Sale not found" });

  // Do not allow editing items via this endpoint to avoid complex stock reconciliation
  const updated = await prisma.sale.update({
    where: { id },
    data: {
      customerName: customerName ?? sale.customerName,
      customerPhone: customerPhone ?? sale.customerPhone,
      paymentMethod: paymentMethod ?? sale.paymentMethod,
      taxAmount: taxAmount != null ? Number(taxAmount) : sale.taxAmount,
    },
  });

  res.json(updated);
};

export const deleteSale = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) return res.status(404).json({ message: "Sale not found" });
  if (sale.isDebt) return res.status(400).json({ message: "Cannot delete a sale with outstanding debt" });

  // Revert product stock quantities
  await Promise.all(
    sale.items.map((item) =>
      prisma.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } })
    )
  );

  // Delete related sale items before deleting the sale to avoid FK constraint errors
  await prisma.saleItem.deleteMany({ where: { saleId: id } });
  await prisma.sale.delete({ where: { id } });
  res.json({ message: "Sale deleted" });
};
