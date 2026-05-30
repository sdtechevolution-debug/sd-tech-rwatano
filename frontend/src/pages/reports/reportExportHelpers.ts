import { formatCurrency } from "../../utils/format";
import type { TranslationKeys } from "../../context/LanguageContext";

export const getDailyCsvSummaryRows = (dayMetrics: any, selectedDate: string) => [
  ["SD TECH RWATANO - Daily Report"],
  ["Date:", selectedDate],
  [""],
  ["SUMMARY"],
  ["Total Revenue", (dayMetrics?.totalRevenue || 0).toLocaleString()],
  ["Total Expenses", (dayMetrics?.totalExpenses || 0).toLocaleString()],
  ["Debt Payments Cash", (dayMetrics?.debtPaymentsCash || 0).toLocaleString()],
  ["Debt Payments MOMO", (dayMetrics?.debtPaymentsMomo || 0).toLocaleString()],
  ["Outstanding Debt", (dayMetrics?.debt || 0).toLocaleString()],
  ["Net Profit", (dayMetrics?.netProfit || 0).toLocaleString()],
];

export const getDailyCsvDebtPaymentRows = (debtPaymentsDetails: any[] = []) => {
  if (!debtPaymentsDetails.length) return [];

  return [
    [""],
    ["DEBT PAYMENTS"],
    ["Time", "Customer", "Phone", "Payment Method", "Note", "Amount"],
    ...debtPaymentsDetails.map((payment) => [
      payment.time,
      payment.customerName || '-',
      payment.customerPhone || '-',
      payment.paymentMethod,
      payment.note || "-",
      payment.amount.toLocaleString(),
    ]),
  ];
};

export const getMonthlyCsvSummaryRows = (
  monthlyReport: any,
  t: (key: TranslationKeys) => string,
  cashVsMomo: string
) => [
  [t("saleRevenue"), formatCurrency(monthlyReport?.totalSalesReceived)],
  [t("saleProfit"), formatCurrency(monthlyReport?.salesProfit)],
  [t("serviceRevenue"), formatCurrency(monthlyReport?.totalServicesAmount)],
  [t("totalMonthlyRevenue"), formatCurrency(monthlyReport?.totalPeriodRevenue)],
  [t("monthlyExpenses"), formatCurrency(monthlyReport?.monthlyExpenses)],
  [t("totalCashReceived"), formatCurrency(monthlyReport?.totalCash)],
  [t("totalMomoReceived"), formatCurrency(monthlyReport?.totalMomo)],
  [t("totalDebtPayments"), formatCurrency(monthlyReport?.totalDebtPayments)],
  [t("outstandingDebt"), formatCurrency(monthlyReport?.outstandingDebt)],
  [t("cashVsMomo"), cashVsMomo],
];
