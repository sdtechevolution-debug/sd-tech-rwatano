export type ServiceDay = {
  date: string;
  label: string;
  amount: number;
  items?: unknown[];
};

export type DailyBreakdownRow = {
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
};

export type SaleSummary = {
  id: string;
  customerName: string;
  totalAmount: number;
  totalProfit?: number;
  paymentMethod?: string;
  createdAt: string;
};

export type ServiceSummary = {
  id: string;
  category: string;
  description?: string;
  amount: number;
  paymentMethod?: string;
  createdAt: string;
};

export type MonthlyReport = {
  month?: string;
  totalSalesReceived?: number;
  salesProfit?: number;
  monthlyExpenses?: number;
  totalServicesAmount?: number;
  totalPeriodRevenue?: number;
  salesCash?: number;
  salesMomo?: number;
  servicesCash?: number;
  servicesMomo?: number;
  totalCash?: number;
  totalMomo?: number;
  debtPaymentsCash?: number;
  debtPaymentsMomo?: number;
  totalDebtPayments?: number;
  outstandingDebt?: number;
  serviceDays?: ServiceDay[];
  serviceTotalAmount?: number;
  dailyBreakdown?: DailyBreakdownRow[];
  salesSummary?: SaleSummary[];
  serviceSummary?: ServiceSummary[];
};

export type DayMetrics = {
  totalRevenue?: number;
  salesRevenue?: number;
  servicesRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
  salesDetails?: unknown[];
  servicesDetails?: unknown[];
  expensesDetails?: unknown[];
  debtPaymentsCash?: number;
  debtPaymentsMomo?: number;
  debt?: number;
  salesCash?: number;
  salesMomo?: number;
  itemsSoldCount?: number;
  lowStockCount?: number;
  totalCash?: number;
  totalMomo?: number;
};

export type Metrics = {
  mobileTotals?: Record<string, number>;
  dailyRevenue?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  netProfit?: number;
  stockValue?: number;
  totalExpenses?: number;
  debtBalance?: number;
  serviceIncome?: number;
};
