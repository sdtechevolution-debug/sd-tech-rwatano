import React from "react";
import { formatCurrency } from "../../utils/format";
import type { MonthlyReport } from "../../types/analytics";

type Props = {
  monthlyReport: MonthlyReport | null;
};

const OwnerDecisionMetrics: React.FC<Props> = ({ monthlyReport }) => {
  if (!monthlyReport) return <div className="surface-card">No owner metrics available.</div>;

  const rows = [
    ["Total Sales Received", monthlyReport.totalSalesReceived || 0],
    ["Sales Profit", monthlyReport.salesProfit || 0],
    ["Total Period Revenue", monthlyReport.totalPeriodRevenue || 0],
    ["Monthly Expenses", monthlyReport.monthlyExpenses || 0],
    ["Total Cash", monthlyReport.totalCash || 0],
    ["Total MOMO", monthlyReport.totalMomo || 0],
    ["Total Debt Payments", monthlyReport.totalDebtPayments || 0],
    ["Outstanding Debt", monthlyReport.outstandingDebt || 0],
    [
      "Cash vs MOMO",
      `${Math.round(((monthlyReport.totalCash || 0) / (monthlyReport.totalPeriodRevenue || 1)) * 100)}% / ${Math.round(((monthlyReport.totalMomo || 0) / (monthlyReport.totalPeriodRevenue || 1)) * 100)}%`,
    ],
  ];

  return (
    <div className="surface-card">
      <h3 className="text-lg font-semibold">Owner Decision Metrics</h3>
      <p className="text-sm text-slate-500 mb-4">Monthly revenue, profit and cash-versus-MOMO details for owner review.</p>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900"><th className="px-4 py-2 text-left">Metric</th><th className="px-4 py-2 text-left">Value</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-950"}
              >
                <td className="px-4 py-2">{r[0]}</td>
                <td className="px-4 py-2 font-semibold">{typeof r[1] === 'number' ? formatCurrency(r[1]) : r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerDecisionMetrics;
