import React from "react";
import { formatCurrency } from "../../utils/format";
import type { Metrics } from "../../types/analytics";

type Props = {
  metrics: Metrics | null;
};

const BusinessSummary: React.FC<Props> = ({ metrics }) => {
  const rows = [
    ["Total Revenue", metrics?.totalRevenue ?? 0],
    ["Daily Revenue", metrics?.dailyRevenue ?? 0],
    ["Monthly Revenue", metrics?.monthlyRevenue ?? 0],
    ["Total Expenses", metrics?.totalExpenses ?? 0],
    ["Debt Balance", metrics?.debtBalance ?? 0],
    ["Net Profit", metrics?.netProfit ?? 0],
  ];

  return (
    <div className="surface-card">
      <h3 className="text-lg font-semibold mb-3">Business Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900">
              <th className="text-left px-4 py-2">Metric</th>
              <th className="text-left px-4 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-950"}
              >
                <td className="px-4 py-3">{r[0]}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(r[1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessSummary;
