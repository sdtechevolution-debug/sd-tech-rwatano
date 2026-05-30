import { Request, Response } from "express";
import prisma from "../utils/prisma";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
  const [sales, expenses, products, services, debts, mobileTransactions] = await Promise.all([
    prisma.sale.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.expense.findMany(),
    prisma.product.findMany(),
    prisma.service.findMany(),
    prisma.debt.findMany(),
    prisma.mobileMoneyTransaction.findMany(),
  ]);

  const totalSalesRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalServiceRevenue = services.reduce((sum, service) => sum + service.amount, 0);
  const totalRevenue = totalSalesRevenue + totalServiceRevenue;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dailySalesRevenue = sales
    .filter((sale) => {
      const d = new Date(sale.createdAt);
      return d >= todayStart && d < tomorrowStart;
    })
    .reduce((sum, sale) => sum + sale.totalAmount, 0);
  const dailyServiceRevenue = services
    .filter((service) => {
      const d = new Date(service.createdAt);
      return d >= todayStart && d < tomorrowStart;
    })
    .reduce((sum, service) => sum + service.amount, 0);
  const dailyRevenue = dailySalesRevenue + dailyServiceRevenue;
  const monthlySalesRevenue = sales.filter((sale) => new Date(sale.createdAt).getMonth() === new Date().getMonth() && new Date(sale.createdAt).getFullYear() === new Date().getFullYear())
    .reduce((sum, sale) => sum + sale.totalAmount, 0);
  const monthlyServiceRevenue = services.filter((service) => new Date(service.createdAt).getMonth() === new Date().getMonth() && new Date(service.createdAt).getFullYear() === new Date().getFullYear())
    .reduce((sum, service) => sum + service.amount, 0);
  const monthlyRevenue = monthlySalesRevenue + monthlyServiceRevenue;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const stockValue = products.reduce((sum, product) => sum + product.buyPrice * product.stockQuantity, 0);
  const lowStock = products.filter((product) => product.stockQuantity <= product.reorderPoint);
  const bestSelling = products
    .map((product) => {
      const unitsSold = sales.flatMap((sale) => sale.items).filter((item) => item.productId === product.id).reduce((count, item) => count + item.quantity, 0);
      return { ...product, unitsSold };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);
  const serviceIncome = services.reduce((sum, service) => sum + service.amount, 0);
  const debtBalance = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const mobileTotals = mobileTransactions.reduce(
    (acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + tx.amount;
      acc.commission = (acc.commission || 0) + tx.commission;
      return acc;
    },
    { commission: 0 } as Record<string, number>
  );

  // Fetch debt payments and compute cash/momo tallies excluding unpaid sales/services
  const debtPayments = await prisma.debtPayment.findMany();

  const salesCash = sales.filter((s) => s.paidAmount > 0 && s.paymentMethod === "CASH").reduce((sum, s) => sum + s.paidAmount, 0);
  const salesMomo = sales.filter((s) => s.paidAmount > 0 && s.paymentMethod === "MOMO").reduce((sum, s) => sum + s.paidAmount, 0);
  const servicesCash = services.filter((svc) => svc.paidAmount > 0 && svc.paymentMethod === "CASH").reduce((sum, svc) => sum + svc.paidAmount, 0);
  const servicesMomo = services.filter((svc) => svc.paidAmount > 0 && svc.paymentMethod === "MOMO").reduce((sum, svc) => sum + svc.paidAmount, 0);

  const salesDebt = sales.filter((s) => s.remainingAmount > 0).reduce((sum, s) => sum + s.remainingAmount, 0);
  const servicesDebt = services.filter((svc) => svc.remainingAmount > 0).reduce((sum, svc) => sum + svc.remainingAmount, 0);

  const debtPaymentsCash = debtPayments.filter((p) => p.paymentMethod === "CASH").reduce((sum, p) => sum + p.amount, 0);
  const debtPaymentsMomo = debtPayments.filter((p) => p.paymentMethod === "MOMO").reduce((sum, p) => sum + p.amount, 0);

  const totalCash = salesCash + servicesCash + debtPaymentsCash;
  const totalMomo = salesMomo + servicesMomo + debtPaymentsMomo;

  const dailySalesCash = sales.filter((sale) => {
    const d = new Date(sale.createdAt);
    return d >= todayStart && d < tomorrowStart && sale.paidAmount > 0 && sale.paymentMethod === "CASH";
  }).reduce((sum, sale) => sum + sale.paidAmount, 0);
  const dailySalesMomo = sales.filter((sale) => {
    const d = new Date(sale.createdAt);
    return d >= todayStart && d < tomorrowStart && sale.paidAmount > 0 && sale.paymentMethod === "MOMO";
  }).reduce((sum, sale) => sum + sale.paidAmount, 0);
  const dailyServicesCash = services.filter((svc) => {
    const d = new Date(svc.createdAt);
    return d >= todayStart && d < tomorrowStart && svc.paidAmount > 0 && svc.paymentMethod === "CASH";
  }).reduce((sum, svc) => sum + svc.paidAmount, 0);
  const dailyServicesMomo = services.filter((svc) => {
    const d = new Date(svc.createdAt);
    return d >= todayStart && d < tomorrowStart && svc.paidAmount > 0 && svc.paymentMethod === "MOMO";
  }).reduce((sum, svc) => sum + svc.paidAmount, 0);

  const dailyDebtPaymentsCash = debtPayments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= todayStart && d < tomorrowStart && p.paymentMethod === "CASH";
  }).reduce((sum, p) => sum + p.amount, 0);
  const dailyDebtPaymentsMomo = debtPayments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= todayStart && d < tomorrowStart && p.paymentMethod === "MOMO";
  }).reduce((sum, p) => sum + p.amount, 0);

  const dailyCash = dailySalesCash + dailyServicesCash + dailyDebtPaymentsCash;
  const dailyMomo = dailySalesMomo + dailyServicesMomo + dailyDebtPaymentsMomo;

  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const monthlySalesCash = sales.filter((sale) => {
    const d = new Date(sale.createdAt);
    return d >= monthStart && d < tomorrowStart && !sale.isDebt && sale.paymentMethod === "CASH";
  }).reduce((sum, sale) => sum + sale.totalAmount, 0);
  const monthlySalesMomo = sales.filter((sale) => {
    const d = new Date(sale.createdAt);
    return d >= monthStart && d < tomorrowStart && !sale.isDebt && sale.paymentMethod === "MOMO";
  }).reduce((sum, sale) => sum + sale.totalAmount, 0);
  const monthlyServicesCash = services.filter((svc) => {
    const d = new Date(svc.createdAt);
    return d >= monthStart && d < tomorrowStart && svc.paidAmount > 0 && svc.paymentMethod === "CASH";
  }).reduce((sum, svc) => sum + svc.paidAmount, 0);
  const monthlyServicesMomo = services.filter((svc) => {
    const d = new Date(svc.createdAt);
    return d >= monthStart && d < tomorrowStart && svc.paidAmount > 0 && svc.paymentMethod === "MOMO";
  }).reduce((sum, svc) => sum + svc.paidAmount, 0);

  const monthlyDebtPaymentsCash = debtPayments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= monthStart && d < tomorrowStart && p.paymentMethod === "CASH";
  }).reduce((sum, p) => sum + p.amount, 0);
  const monthlyDebtPaymentsMomo = debtPayments.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= monthStart && d < tomorrowStart && p.paymentMethod === "MOMO";
  }).reduce((sum, p) => sum + p.amount, 0);

  const monthlyCash = monthlySalesCash + monthlyServicesCash + monthlyDebtPaymentsCash;
  const monthlyMomo = monthlySalesMomo + monthlyServicesMomo + monthlyDebtPaymentsMomo;

  res.json({
    totalRevenue,
    dailyRevenue,
    monthlyRevenue,
    netProfit,
    totalExpenses,
    stockValue,
    lowStock,
    bestSelling,
    serviceIncome,
    debtBalance,
    mobileTotals,
    totalCash,
    totalMomo,
    dailyCash,
    dailyMomo,
    monthlyCash,
    monthlyMomo,
    totalSalesDebt: salesDebt,
    totalServicesDebt: servicesDebt,
    totalDebt: salesDebt + servicesDebt,
    totalDebtPaymentsCash: debtPaymentsCash,
    totalDebtPaymentsMomo: debtPaymentsMomo,
    dailyDebtPaymentsCash,
    dailyDebtPaymentsMomo,
    monthlyDebtPaymentsCash,
    monthlyDebtPaymentsMomo,
  });
};

export const getWeeklyPerformance = async (req: Request, res: Response) => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start } },
    include: { items: true },
    orderBy: { createdAt: 'asc' }
  });

  const services = await prisma.service.findMany({ where: { createdAt: { gte: start } }, orderBy: { createdAt: 'asc' } });

  // Build a map for last 7 days
  const days: { date: string; salesRevenue: number; servicesRevenue: number; itemsSold: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = formatDateKey(d);
    days.push({ date: key, salesRevenue: 0, servicesRevenue: 0, itemsSold: 0 });
  }

  const dayIndex = (date: Date) => {
    const key = formatDateKey(date);
    return days.findIndex((d) => d.date === key);
  };

  for (const sale of sales) {
    const idx = dayIndex(new Date(sale.createdAt));
    if (idx >= 0) {
      days[idx].salesRevenue += sale.totalAmount;
      days[idx].itemsSold += sale.items.reduce((s, it) => s + it.quantity, 0);
    }
  }

  for (const svc of services) {
    const idx = dayIndex(new Date(svc.createdAt));
    if (idx >= 0) {
      days[idx].servicesRevenue += svc.amount;
    }
  }

  res.json({ days });
};

export const getMonthlyServiceRevenue = async (req: Request, res: Response) => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const services = await prisma.service.findMany({
    where: { createdAt: { gte: monthStart } },
    orderBy: { createdAt: 'asc' }
  });

  const currentDay = new Date(today);
  currentDay.setHours(0, 0, 0, 0);

  const days: { date: string; label: string; amount: number }[] = [];
  for (let day = 1; day <= currentDay.getDate(); day++) {
    const d = new Date(today.getFullYear(), today.getMonth(), day);
    const dateKey = formatDateKey(d);
    days.push({
      date: dateKey,
      label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      amount: 0,
    });
  }

  const dayIndex = (date: Date) => {
    const key = formatDateKey(date);
    return days.findIndex((d) => d.date === key);
  };

  for (const svc of services) {
    const idx = dayIndex(new Date(svc.createdAt));
    if (idx >= 0) {
      days[idx].amount += svc.amount;
    }
  }

  const totalAmount = services.reduce((sum, svc) => sum + svc.amount, 0);
  res.json({ days, totalAmount });
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  const monthParam = String(req.query.month || "");
  const today = new Date();
  const [year, month] = monthParam.match(/^\d{4}-\d{2}$/)?.[0]?.split("-")?.map(Number) ?? [today.getFullYear(), today.getMonth() + 1];
  const start = new Date(year, month - 1, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const [sales, services, expenses, debtPayments, outstandingDebts] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { items: true }
    }),
    prisma.service.findMany({
      where: { createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.expense.findMany({
      where: { createdAt: { gte: start, lt: end } }
    }),
    prisma.debtPayment.findMany({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.debt.findMany({ where: { remainingAmount: { gt: 0 } } }),
  ]);

  const totalSalesReceived = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const salesProfit = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.profit, 0), 0);
  const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalServicesAmount = services.reduce((sum, svc) => sum + svc.amount, 0);
  const totalPeriodRevenue = totalSalesReceived + totalServicesAmount;

  const salesCash = sales.filter((sale) => !sale.isDebt && sale.paymentMethod === "CASH").reduce((sum, sale) => sum + sale.totalAmount, 0);
  const salesMomo = sales.filter((sale) => !sale.isDebt && sale.paymentMethod === "MOMO").reduce((sum, sale) => sum + sale.totalAmount, 0);
  const servicesCash = services.filter((svc) => !svc.isDebt && svc.paymentMethod === "CASH").reduce((sum, svc) => sum + svc.amount, 0);
  const servicesMomo = services.filter((svc) => !svc.isDebt && svc.paymentMethod === "MOMO").reduce((sum, svc) => sum + svc.amount, 0);

  const debtPaymentsCash = debtPayments.filter((p) => p.paymentMethod === "CASH").reduce((sum, p) => sum + p.amount, 0);
  const debtPaymentsMomo = debtPayments.filter((p) => p.paymentMethod === "MOMO").reduce((sum, p) => sum + p.amount, 0);

  const totalCash = salesCash + servicesCash + debtPaymentsCash;
  const totalMomo = salesMomo + servicesMomo + debtPaymentsMomo;
  const outstandingDebt = outstandingDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const totalDebtPayments = debtPaymentsCash + debtPaymentsMomo;

  const serviceDayMap: Record<string, { date: string; label: string; amount: number }> = {};
  const monthEnd = new Date(start);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  for (let d = new Date(start); d < monthEnd; d.setDate(d.getDate() + 1)) {
    const dateKey = formatDateKey(d);
    serviceDayMap[dateKey] = {
      date: dateKey,
      label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      amount: 0,
    };
  }

  for (const svc of services) {
    const date = new Date(svc.createdAt);
    const dateKey = formatDateKey(date);
    if (serviceDayMap[dateKey]) {
      serviceDayMap[dateKey].amount += svc.amount;
    }
  }

  const serviceDayList = Object.values(serviceDayMap).sort((a, b) => a.date.localeCompare(b.date));

  const salesSummary = sales.map((sale) => ({
    id: sale.id,
    customerName: sale.customerName || "Walk-in",
    totalAmount: sale.totalAmount,
    totalProfit: sale.totalProfit,
    paymentMethod: sale.paymentMethod,
    createdAt: formatDateKey(sale.createdAt),
  }));

  const serviceSummary = services.map((svc) => ({
    id: svc.id,
    category: svc.category,
    description: svc.description || "",
    amount: svc.amount,
    paymentMethod: svc.paymentMethod,
    createdAt: formatDateKey(svc.createdAt),
  }));

  const dailyMap: Record<string, {
    date: string;
    day: string;
    salesRevenue: number;
    serviceRevenue: number;
    salesCash: number;
    salesMomo: number;
    serviceCash: number;
    serviceMomo: number;
    expenseAmount: number;
    debtPaymentsCash: number;
    debtPaymentsMomo: number;
    totalCash: number;
    totalMomo: number;
    totalRevenue: number;
  }> = {};

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const dateKey = formatDateKey(d);
    dailyMap[dateKey] = {
      date: dateKey,
      day: d.toLocaleDateString("en-US", { weekday: "long" }),
      salesRevenue: 0,
      serviceRevenue: 0,
      salesCash: 0,
      salesMomo: 0,
      serviceCash: 0,
      serviceMomo: 0,
      expenseAmount: 0,
      debtPaymentsCash: 0,
      debtPaymentsMomo: 0,
      totalCash: 0,
      totalMomo: 0,
      totalRevenue: 0,
    };
  }

  for (const sale of sales) {
    const saleDate = formatDateKey(sale.createdAt);
    const row = dailyMap[saleDate];
    if (!row) continue;
    row.salesRevenue += sale.totalAmount;
    if (!sale.isDebt) {
      if (sale.paymentMethod === "CASH") {
        row.salesCash += sale.totalAmount;
      } else {
        row.salesMomo += sale.totalAmount;
      }
    }
  }

  for (const svc of services) {
    const svcDate = formatDateKey(svc.createdAt);
    const row = dailyMap[svcDate];
    if (!row) continue;
    row.serviceRevenue += svc.amount;
    if (!svc.isDebt) {
      if (svc.paymentMethod === "CASH") {
        row.serviceCash += svc.amount;
      } else {
        row.serviceMomo += svc.amount;
      }
    }
  }

  for (const expense of expenses) {
    const expenseDate = formatDateKey(expense.createdAt);
    const row = dailyMap[expenseDate];
    if (!row) continue;
    row.expenseAmount += expense.amount;
  }

  // Include debt payments in the daily map (count as cash or momo inflows)
  const debtPaymentsAll = await prisma.debtPayment.findMany({ where: { createdAt: { gte: start, lt: end } } });
  for (const p of debtPaymentsAll) {
    const pDate = formatDateKey(p.createdAt);
    const row = dailyMap[pDate];
    if (!row) continue;
    if (p.paymentMethod === "CASH") row.debtPaymentsCash += p.amount;
    if (p.paymentMethod === "MOMO") row.debtPaymentsMomo += p.amount;
  }

  const dailyBreakdown = Object.values(dailyMap).map((row) => {
    const totalCashDaily = row.salesCash + row.serviceCash + row.debtPaymentsCash;
    const totalMomoDaily = row.salesMomo + row.serviceMomo + row.debtPaymentsMomo;
    return {
      ...row,
      totalCash: totalCashDaily,
      totalMomo: totalMomoDaily,
      totalRevenue: row.salesRevenue + row.serviceRevenue,
    };
  });

  res.json({
    month: `${year}-${String(month).padStart(2, "0")}`,
    totalSalesReceived,
    salesProfit,
    monthlyExpenses,
    totalServicesAmount,
    totalPeriodRevenue,
    salesCash,
    salesMomo,
    servicesCash,
    servicesMomo,
    totalCash,
    totalMomo,
    debtPaymentsCash,
    debtPaymentsMomo,
    totalDebtPayments,
    outstandingDebt,
    serviceDays: serviceDayList,
    serviceTotalAmount: totalServicesAmount,
    dailyBreakdown,
    salesSummary,
    serviceSummary,
  });
};

export const getTodayMetrics = async (req: Request, res: Response) => {
  const dateParam = String(req.query.date || "");
  let start = new Date();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const [year, month, day] = dateParam.split("-").map(Number);
    start = new Date(year, month - 1, day);
  }
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [todaySales, todayServices, todayExpenses, allProducts] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { items: { include: { product: true } } }
    }),
    prisma.service.findMany({
      where: { createdAt: { gte: start, lt: end } }
    }),
    prisma.expense.findMany({
      where: { createdAt: { gte: start, lt: end } }
    }),
    prisma.product.findMany()
  ]);

  const salesRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const servicesRevenue = todayServices.reduce((sum, svc) => sum + svc.amount, 0);
  const totalExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRevenue = salesRevenue + servicesRevenue;
  
  const isFullyPaidSale = (sale: any) => !sale.isDebt && sale.paidAmount === 0 && sale.totalAmount > 0;
  const isFullyPaidService = (svc: any) => !svc.isDebt && svc.paidAmount === 0 && svc.amount > 0;

  const salesCash = todaySales
    .filter((sale) => (sale.paidAmount > 0 || isFullyPaidSale(sale)) && sale.paymentMethod === "CASH")
    .reduce((sum, sale) => sum + (sale.paidAmount > 0 ? sale.paidAmount : sale.totalAmount), 0);
  const salesMomo = todaySales
    .filter((sale) => (sale.paidAmount > 0 || isFullyPaidSale(sale)) && sale.paymentMethod === "MOMO")
    .reduce((sum, sale) => sum + (sale.paidAmount > 0 ? sale.paidAmount : sale.totalAmount), 0);
  const salesDebt = todaySales
    .filter((sale) => sale.remainingAmount > 0)
    .reduce((sum, sale) => sum + sale.remainingAmount, 0);

  const servicesCash = todayServices
    .filter((svc) => (svc.paidAmount > 0 || isFullyPaidService(svc)) && svc.paymentMethod === "CASH")
    .reduce((sum, svc) => sum + (svc.paidAmount > 0 ? svc.paidAmount : svc.amount), 0);
  const servicesMomo = todayServices
    .filter((svc) => (svc.paidAmount > 0 || isFullyPaidService(svc)) && svc.paymentMethod === "MOMO")
    .reduce((sum, svc) => sum + (svc.paidAmount > 0 ? svc.paidAmount : svc.amount), 0);
  const servicesDebt = todayServices
    .filter((svc) => svc.remainingAmount > 0)
    .reduce((sum, svc) => sum + svc.remainingAmount, 0);

  const allDebts = await prisma.debt.findMany();
  const debt = allDebts.reduce((sum, entry) => sum + entry.remainingAmount, 0);

  // Include debt payments made today
  const todayDebtPayments = await prisma.debtPayment.findMany({ where: { createdAt: { gte: start, lt: end } }, include: { debt: true } });
  const debtPaymentsCash = todayDebtPayments.filter((p) => p.paymentMethod === "CASH").reduce((s, p) => s + p.amount, 0);
  const debtPaymentsMomo = todayDebtPayments.filter((p) => p.paymentMethod === "MOMO").reduce((s, p) => s + p.amount, 0);

  const debtPaymentsDetails = todayDebtPayments.map((payment) => ({
    id: payment.id,
    time: payment.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: payment.paymentMethod || 'CASH',
    amount: payment.amount,
    note: payment.note || '-',
    customerName: payment.debt?.customerName || '-',
    customerPhone: payment.debt?.customerPhone || '-',
  }));

  // Today's products sold with details
  const soldProducts = todaySales
    .flatMap((sale) => sale.items.map((item) => ({ ...item, saleTotalAmount: sale.totalAmount })))
    .reduce((acc: any[], item) => {
      const existing = acc.find((p) => p.productId === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({ productId: item.productId, quantity: item.quantity, product: item.product });
      }
      return acc;
    }, []);

  const lowStockItems = allProducts.filter((p) => p.stockQuantity <= p.reorderPoint);
  const netProfit = totalRevenue - totalExpenses;

  // Detailed sales list
  const getDisplayPaymentMethod = (paymentMethod: string | null | undefined, isDebt: boolean, paidAmount: number | null | undefined) => {
    if (isDebt && !paidAmount) return 'DEBT';
    return paymentMethod || 'UNKNOWN';
  };

  const salesDetails = todaySales.map((sale) => ({
    id: sale.id,
    time: sale.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    customerName: sale.customerName || 'Walk-in',
    paymentMethod: getDisplayPaymentMethod(sale.paymentMethod, sale.isDebt, sale.paidAmount),
    items: sale.items.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.sellPrice,
      total: item.quantity * item.product.sellPrice,
      profit: item.profit
    })),
    totalAmount: sale.totalAmount,
    totalProfit: sale.totalProfit || 0
  }));

  // Detailed services list
  const servicesDetails = todayServices.map((svc) => ({
    id: svc.id,
    time: svc.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    category: svc.category,
    description: svc.description || '-',
    paymentMethod: getDisplayPaymentMethod(svc.paymentMethod, svc.isDebt, svc.paidAmount),
    amount: svc.amount
  }));

  // Detailed expenses list
  const expensesDetails = todayExpenses.map((exp) => ({
    id: exp.id,
    time: exp.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    description: exp.description || '-',
    amount: exp.amount,
    category: exp.category || 'General'
  }));

  res.json({
    todayDate: formatDateKey(start),
    salesRevenue,
    salesCash,
    salesMomo,
    salesDebt,
    servicesRevenue,
    servicesCash,
    servicesMomo,
    servicesDebt,
    totalRevenue,
    debt,
    debtPaymentsCash,
    debtPaymentsMomo,
    totalCash: salesCash + servicesCash + debtPaymentsCash,
    totalMomo: salesMomo + servicesMomo + debtPaymentsMomo,
    totalExpenses,
    netProfit,
    itemsSoldCount: todaySales.reduce((sum, sale) => sum + sale.items.reduce((qty, item) => qty + item.quantity, 0), 0),
    soldProducts: soldProducts.map((p: any) => ({
      name: p.product.name,
      quantity: p.quantity,
      price: p.product.sellPrice,
      total: p.quantity * p.product.sellPrice
    })),
    lowStockItems,
    lowStockCount: lowStockItems.length,
    salesDetails,
    servicesDetails,
    expensesDetails,
    debtPaymentsDetails,
    transactionCount: todaySales.length + todayServices.length + todayExpenses.length + todayDebtPayments.length
  });
};
