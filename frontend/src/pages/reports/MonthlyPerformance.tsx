import React from "react";
import { formatCurrency } from "../../utils/format";
import type { MonthlyReport } from "../../types/analytics";

type Props = {
  monthlyReport: MonthlyReport | null;
};

const MonthlyPerformance: React.FC<Props> = ({ monthlyReport }) => {
  if (!monthlyReport) {
    return <div className="surface-card">No monthly data available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="surface-card">
        <h3 className="text-lg font-semibold">Monthly Performance</h3>
        <p className="text-sm text-slate-500">Owner-level totals for cash, MOMO, profit and monthly revenue.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="text-left px-4 py-2">Metric</th>
                <th className="text-left px-4 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-4 py-2">Sales Received</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.totalSalesReceived || 0)}</td></tr>
              <tr><td className="px-4 py-2">Sales Profit</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.salesProfit || 0)}</td></tr>
              <tr><td className="px-4 py-2">Service Revenue</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.totalServicesAmount || 0)}</td></tr>
              <tr><td className="px-4 py-2">Total Monthly Revenue</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.totalPeriodRevenue || 0)}</td></tr>
              <tr><td className="px-4 py-2">Monthly Expenses</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.monthlyExpenses || 0)}</td></tr>
              <tr><td className="px-4 py-2">Total Cash Received</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.totalCash || 0)}</td></tr>
              <tr><td className="px-4 py-2">Total MOMO Received</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.totalMomo || 0)}</td></tr>
            <tr><td className="px-4 py-2">Total Debt Payments</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.totalDebtPayments || 0)}</td></tr>
            <tr><td className="px-4 py-2">Outstanding Debt</td><td className="px-4 py-2 font-semibold">{formatCurrency(monthlyReport.outstandingDebt || 0)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="surface-card">
        <h4 className="font-semibold">Service Revenue by Day</h4>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-50"><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Amount</th></tr>
            </thead>
            <tbody>
                {(monthlyReport.serviceDays || []).map((d: any) => (
                  <tr
                    key={d.date}
                    className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-950"
                  >
                    <td className="px-4 py-2">{d.label}</td>
                    <td className="px-4 py-2 font-semibold">{formatCurrency(d.amount || 0)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPerformance;
