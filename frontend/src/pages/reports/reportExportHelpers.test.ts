import { describe, expect, it } from "vitest";
import { formatCurrency } from "../../utils/format";
import { getDailyCsvSummaryRows, getDailyCsvDebtPaymentRows, getMonthlyCsvSummaryRows } from "./reportExportHelpers";

const t = ((key: string) => key) as (key: any) => string;

describe("reportExportHelpers", () => {
  it("includes debt payment and outstanding debt summary rows for daily export", () => {
    const rows = getDailyCsvSummaryRows(
      {
        totalRevenue: 1200,
        totalExpenses: 400,
        debtPaymentsCash: 80,
        debtPaymentsMomo: 50,
        debt: 670,
        netProfit: 750,
      },
      "2026-05-29"
    );

    expect(rows).toContainEqual(["Debt Payments Cash", "80"]);
    expect(rows).toContainEqual(["Debt Payments MOMO", "50"]);
    expect(rows).toContainEqual(["Outstanding Debt", "670"]);
  });

  it("renders debt payment rows for daily export", () => {
    const rows = getDailyCsvDebtPaymentRows([
      { time: "10:00 AM", paymentMethod: "CASH", note: "Partial", amount: 200, customerName: 'John', customerPhone: '0700000000' },
      { time: "11:15 AM", paymentMethod: "MOMO", note: "Debt collection", amount: 150, customerName: 'Mary', customerPhone: '0781111111' }
    ]);

    expect(rows).toContainEqual(["Time", "Customer", "Phone", "Payment Method", "Note", "Amount"]);
    expect(rows).toContainEqual(["10:00 AM", "John", "0700000000", "CASH", "Partial", "200"]);
    expect(rows).toContainEqual(["11:15 AM", "Mary", "0781111111", "MOMO", "Debt collection", "150"]);
  });

  it("includes debt totals in monthly export summary rows", () => {
    const rows = getMonthlyCsvSummaryRows(
      {
        totalSalesReceived: 1000,
        salesProfit: 300,
        totalServicesAmount: 450,
        totalPeriodRevenue: 1750,
        monthlyExpenses: 500,
        totalCash: 900,
        totalMomo: 850,
        totalDebtPayments: 220,
        outstandingDebt: 520,
      },
      t,
      "51% cash / 49% momo"
    );

    expect(rows).toContainEqual(["totalDebtPayments", formatCurrency(220)]);
    expect(rows).toContainEqual(["outstandingDebt", formatCurrency(520)]);
  });
});
