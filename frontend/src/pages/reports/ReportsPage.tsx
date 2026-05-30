import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../utils/format";
import logoSrc from "../../assets/logo.png";
import React, { Suspense } from "react";
import { getDailyCsvSummaryRows, getDailyCsvDebtPaymentRows, getMonthlyCsvSummaryRows } from "./reportExportHelpers";
const BusinessSummary = React.lazy(() => import("./BusinessSummary"));
const MonthlyPerformance = React.lazy(() => import("./MonthlyPerformance"));
const OwnerDecisionMetrics = React.lazy(() => import("./OwnerDecisionMetrics"));

const chartColors = ["#2563eb", "#f97316", "#14b8a6", "#e11d48", "#c084fc"];

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getLocalMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const parseLocalDateString = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const ReportsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [metrics, setMetrics] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getLocalMonthString());
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [dayMetrics, setDayMetrics] = useState<any>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [dashboardResponse, monthlyReportResponse] = await Promise.all([
          api.get("/analytics/dashboard"),
          api.get("/analytics/monthly-report", { params: { month: selectedMonth } })
        ]);
        setMetrics(dashboardResponse.data);
        setMonthlyReport(monthlyReportResponse.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMetrics();
  }, [selectedMonth]);

  useEffect(() => {
    const loadDailyReport = async () => {
      try {
        const response = await api.get("/analytics/today", { params: { date: selectedDate } });
        setDayMetrics(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadDailyReport();
  }, [selectedDate]);

  const mobileData = metrics
    ? (Object.entries(metrics.mobileTotals || {}) as [string, number][]).map(([key, value]) => ({ name: key, value }))
    : [];

  const monthlyServices = monthlyReport?.serviceDays || [];
  const monthlyServicesTotal = monthlyReport?.serviceTotalAmount || 0;
  const cashVsMomo = monthlyReport?.totalPeriodRevenue
    ? `${Math.round((monthlyReport.totalCash / monthlyReport.totalPeriodRevenue) * 100)}% cash / ${Math.round((monthlyReport.totalMomo / monthlyReport.totalPeriodRevenue) * 100)}% momo`
    : "-";

  const getAmountColorClass = (amount: number) => {
    if (amount === 0) return "text-slate-500 dark:text-slate-400";
    const max = Math.max(...monthlyServices.map((item: any) => item.amount), 0);
    const ratio = max > 0 ? amount / max : 0;
    if (ratio >= 0.7) return "text-emerald-700 dark:text-emerald-300";
    if (ratio >= 0.4) return "text-amber-600 dark:text-amber-300";
    return "text-orange-600 dark:text-orange-300";
  };

  // --- Export modal state and helpers ---
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState<"daily" | "monthly">("daily");
  const [detailedForOwner, setDetailedForOwner] = useState(true);

  const buildReportRows = (mode: "daily" | "monthly", forOwner: boolean) => {
    const rows: any[] = [[t("metric"), t("value")]];

    if (mode === "daily") {
      const dm = dayMetrics || metrics;
      rows.push([t("dailyRevenue"), formatCurrency(dm?.totalRevenue || 0)]);
      rows.push([t("saleRevenue"), formatCurrency(dm?.salesRevenue || 0)]);
      rows.push([t("serviceRevenue"), formatCurrency(dm?.servicesRevenue || 0)]);
      rows.push([t("totalExpenses"), formatCurrency(dm?.totalExpenses ?? (metrics?.totalExpenses || 0))]);
      rows.push([t("netProfit"), formatCurrency(dm?.netProfit ?? ((dm?.totalRevenue || 0) - (dm?.totalExpenses || 0)))]);
    } else {
      rows.push([t("saleRevenue"), formatCurrency(monthlyReport?.totalSalesReceived)]);
      rows.push([t("saleProfit"), formatCurrency(monthlyReport?.salesProfit)]);
      rows.push([t("serviceRevenue"), formatCurrency(monthlyReport?.totalServicesAmount)]);
      rows.push([t("totalMonthlyRevenue"), formatCurrency(monthlyReport?.totalPeriodRevenue)]);
      rows.push([t("monthlyExpenses"), formatCurrency(monthlyReport?.monthlyExpenses)]);
      rows.push([t("totalCashReceived"), formatCurrency(monthlyReport?.totalCash)]);
      rows.push([t("totalMomoReceived"), formatCurrency(monthlyReport?.totalMomo)]);
      rows.push([t("totalDebtPayments"), formatCurrency(monthlyReport?.totalDebtPayments)]);
      rows.push([t("outstandingDebt"), formatCurrency(monthlyReport?.outstandingDebt)]);
      rows.push([t("cashVsMomo"), cashVsMomo]);
      rows.push([t("monthBreakdown"), ""]);
      rows.push([t("date"), t("amount")]);
      monthlyServices.forEach((d: any) => rows.push([d.label || d.date, formatCurrency(d.amount)]));
      rows.push([t("monthTotal"), formatCurrency(monthlyServicesTotal)]);
    }

    if (forOwner) {
      rows.push([t("stockValue"), formatCurrency(metrics?.stockValue)]);
      if (mode === "monthly" && detailedForOwner) {
        rows.push([t("detailedServiceList"), ""]);
        monthlyServices.forEach((d: any) => rows.push([`${t("service")} ${d.label || d.date}`, d.items ? JSON.stringify(d.items) : "-"]));
      }
    }

    return rows;
  };

  const handleExport = (format: "csv" | "pdf") => {
    if (exportMode === "daily") {
      // Daily report with detailed activities
      if (format === "pdf") {
        const salesHtml = (dayMetrics?.salesDetails || [])
          .map((sale: any) => `
            <tr>
              <td colspan="4" style="background: #f3f4f6; font-weight: 700; padding: 8px 12px;">
                ${sale.time} - ${sale.customerName} (${sale.paymentMethod})
              </td>
            </tr>
            ${sale.items.map((item: any) => `
              <tr>
                <td style="padding-left: 24px;">${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toLocaleString()}</td>
                <td>${item.total.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr style="background: #f9fafb;">
              <td colspan="2"></td>
              <td style="font-weight: 700; text-align: right;">Total:</td>
              <td style="font-weight: 700;">${sale.totalAmount.toLocaleString()}</td>
            </tr>
          `)
          .join('');

        const servicesHtml = (dayMetrics?.servicesDetails || [])
          .map((svc: any) => `
            <tr>
              <td>${svc.time}</td>
              <td>${svc.category}</td>
              <td>${svc.description}</td>
              <td>${svc.paymentMethod}</td>
              <td style="font-weight: 700;">${svc.amount.toLocaleString()}</td>
            </tr>
          `)
          .join('');

        const debtPaymentsHtml = (dayMetrics?.debtPaymentsDetails || [])
          .map((payment: any) => `
            <tr>
              <td>${payment.time}</td>
              <td>${payment.customerName || ''}</td>
              <td>${payment.customerPhone || ''}</td>
              <td>${payment.paymentMethod}</td>
              <td>${payment.note}</td>
              <td style="font-weight: 700;">${payment.amount.toLocaleString()}</td>
            </tr>
          `)
          .join('');

        const expensesHtml = (dayMetrics?.expensesDetails || [])
          .map((exp: any) => `
            <tr>
              <td>${exp.time}</td>
              <td>${exp.category}</td>
              <td>${exp.description}</td>
              <td style="font-weight: 700; color: #dc2626;">${exp.amount.toLocaleString()}</td>
            </tr>
          `)
          .join('');

        const html = `
          <html>
            <head>
              <title>SD Tech Rwatano Daily Report - ${selectedDate}</title>
              <style>
                @page { size: A4 portrait; margin: 15mm; }
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
                  color: #0f172a;
                  background: #ffffff;
                  font-size: 0.9rem;
                }
                .page { page-break-after: always; }
                .page:last-child { page-break-after: auto; }
                .report-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 16px;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 12px;
                }
                .brand-logo {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 1rem;
                  font-weight: 700;
                  text-transform: uppercase;
                  color: #0f172a;
                }
                .brand-logo img {
                  height: 40px;
                  width: auto;
                  object-fit: contain;
                }
                .section-title {
                  margin: 16px 0 8px;
                  font-size: 1.1rem;
                  font-weight: 700;
                  color: #0f172a;
                  border-left: 4px solid #2563eb;
                  padding-left: 8px;
                }
                .summary-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 12px;
                  margin: 12px 0;
                }
                .summary-box {
                  border: 1px solid #e5e7eb;
                  padding: 10px;
                  border-radius: 4px;
                  background: #f9fafb;
                }
                .summary-label { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
                .summary-value { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-top: 4px; }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 8px;
                  font-size: 0.85rem;
                }
                th {
                  background: #e2e8f0;
                  color: #0f172a;
                  font-weight: 700;
                  padding: 8px 10px;
                  text-align: left;
                  border: 1px solid #cbd5e1;
                }
                td {
                  padding: 8px 10px;
                  border: 1px solid #e5e7eb;
                }
                tr:nth-child(even) { background: #f9fafb; }
                .highlight { background: #fef3c7; }
                .footer {
                  margin-top: 16px;
                  padding-top: 12px;
                  border-top: 1px solid #e5e7eb;
                  font-size: 0.8rem;
                  color: #6b7280;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="page">
                <div class="report-header">
                  <div class="brand-logo">
                    <img src="${logoSrc}" alt="SD TECH" />
                    SD TECH RWATANO
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 700; font-size: 1rem;">${selectedDate}</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">${parseLocalDateString(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                <h2 style="margin: 0 0 12px; font-size: 1.3rem; color: #0f172a;">Daily Activity Report</h2>

                <div class="summary-grid">
                  <div class="summary-box">
                    <div class="summary-label">Total Revenue</div>
                    <div class="summary-value" style="color: #22c55e;">${(dayMetrics?.totalRevenue || 0).toLocaleString()}</div>
                  </div>
                  <div class="summary-box">
                    <div class="summary-label">Total Expenses</div>
                    <div class="summary-value" style="color: #dc2626;">${(dayMetrics?.totalExpenses || 0).toLocaleString()}</div>
                  </div>
                  <div class="summary-box">
                    <div class="summary-label">Net Profit</div>
                    <div class="summary-value" style="color: #2563eb;">${(dayMetrics?.netProfit || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div class="summary-grid" style="grid-template-columns: 1fr 1fr;">
                  <div class="summary-box">
                    <div class="summary-label">Sales Revenue</div>
                    <div class="summary-value">${(dayMetrics?.salesRevenue || 0).toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">
                      Cash: ${(dayMetrics?.salesCash || 0).toLocaleString()} | MOMO: ${(dayMetrics?.salesMomo || 0).toLocaleString()}
                    </div>
                  </div>
                  <div class="summary-box">
                    <div class="summary-label">Services Revenue</div>
                    <div class="summary-value">${(dayMetrics?.servicesRevenue || 0).toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">
                      Cash: ${(dayMetrics?.servicesCash || 0).toLocaleString()} | MOMO: ${(dayMetrics?.servicesMomo || 0).toLocaleString()}
                    </div>
                  </div>
                  <div class="summary-box">
                    <div class="summary-label">Debt Payments</div>
                    <div class="summary-value">${((dayMetrics?.debtPaymentsCash || 0) + (dayMetrics?.debtPaymentsMomo || 0)).toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">
                      Cash: ${(dayMetrics?.debtPaymentsCash || 0).toLocaleString()} | MOMO: ${(dayMetrics?.debtPaymentsMomo || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                ${dayMetrics?.salesDetails && dayMetrics.salesDetails.length > 0 ? `
                <h3 class="section-title">Sales Transactions (${dayMetrics.salesDetails.length})</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="width: 60px;">Qty</th>
                      <th style="width: 80px;">Unit Price</th>
                      <th style="width: 80px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${salesHtml}
                  </tbody>
                </table>
                ` : '<p style="color: #9ca3af; margin-top: 12px;">No sales transactions recorded.</p>'}

                ${dayMetrics?.servicesDetails && dayMetrics.servicesDetails.length > 0 ? `
                <h3 class="section-title">Services Transactions (${dayMetrics.servicesDetails.length})</h3>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 60px;">Time</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th style="width: 70px;">Method</th>
                      <th style="width: 80px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${servicesHtml}
                  </tbody>
                </table>
                ` : ''}

                ${dayMetrics?.debtPaymentsDetails && dayMetrics.debtPaymentsDetails.length > 0 ? `
                <h3 class="section-title">Debt Payments (${dayMetrics.debtPaymentsDetails.length})</h3>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 70px;">Time</th>
                      <th style="width: 160px;">Customer</th>
                      <th style="width: 120px;">Phone</th>
                      <th style="width: 100px;">Method</th>
                      <th>Note</th>
                      <th style="width: 100px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${debtPaymentsHtml}
                  </tbody>
                </table>
                ` : ''}

                ${dayMetrics?.expensesDetails && dayMetrics.expensesDetails.length > 0 ? `
                <h3 class="section-title">Expenses (${dayMetrics.expensesDetails.length})</h3>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 60px;">Time</th>
                      <th style="width: 100px;">Category</th>
                      <th>Description</th>
                      <th style="width: 80px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${expensesHtml}
                  </tbody>
                </table>
                ` : '<p style="color: #9ca3af; margin-top: 12px;">No expenses recorded.</p>'}

                <div class="footer">
                  <div>Report Generated: ${new Date().toLocaleString()}</div>
                  <div>SD TECH Rwatano © 2026 - Daily Activity Report</div>
                </div>
              </div>
            </body>
          </html>
        `;

        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        try {
          printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
        } catch (e) {
          setTimeout(() => printWindow.print(), 700);
        }
      } else {
        // CSV export for daily
        const csvLines: any[] = [
          ...getDailyCsvSummaryRows(dayMetrics, selectedDate),
          [''],
          ['SALES TRANSACTIONS'],
          ['Time', 'Customer', 'Payment Method', 'Items', 'Total Amount'],
        ];

        (dayMetrics?.salesDetails || []).forEach((sale: any) => {
          csvLines.push([sale.time, sale.customerName, sale.paymentMethod, sale.items.length, sale.totalAmount.toLocaleString()]);
          sale.items.forEach((item: any) => {
            csvLines.push(['', '', '', `${item.productName} (${item.quantity}x)`, item.total.toLocaleString()]);
          });
        });

        csvLines.push(['']);
        csvLines.push(['SERVICES TRANSACTIONS']);
        csvLines.push(['Time', 'Category', 'Description', 'Method', 'Amount']);

        (dayMetrics?.servicesDetails || []).forEach((svc: any) => {
          csvLines.push([svc.time, svc.category, svc.description, svc.paymentMethod, svc.amount.toLocaleString()]);
        });

        csvLines.push(...getDailyCsvDebtPaymentRows(dayMetrics?.debtPaymentsDetails || []));

        csvLines.push(['']);
        csvLines.push(['EXPENSES']);
        csvLines.push(['Time', 'Category', 'Description', 'Amount']);

        (dayMetrics?.expensesDetails || []).forEach((exp: any) => {
          csvLines.push([exp.time, exp.category, exp.description, exp.amount.toLocaleString()]);
        });

        const csvContent = csvLines.map((row) => row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `sdtech-daily-report-${selectedDate}.csv`;
        link.click();
      }
    } else if (exportMode === "monthly") {
      const summaryRows = getMonthlyCsvSummaryRows(monthlyReport, t, cashVsMomo);

      const breakdown = monthlyReport?.dailyBreakdown || [];
      
      // Helper to strip "RWF" and format just the number
      const formatValue = (value: string | number) => {
        if (typeof value === 'number') return value.toLocaleString();
        return String(value).replace(/RWF\s*/g, '').trim();
      };

      const breakdownRows = breakdown.map((day: any) => [
        day.date,
        day.day,
        formatValue(formatCurrency(day.salesCash)),
        formatValue(formatCurrency(day.salesMomo)),
        formatValue(formatCurrency(day.serviceCash)),
        formatValue(formatCurrency(day.serviceMomo)),
        formatValue(formatCurrency(day.debtPaymentsCash)),
        formatValue(formatCurrency(day.debtPaymentsMomo)),
        formatValue(formatCurrency(day.expenseAmount)),
        formatValue(formatCurrency(day.totalCash)),
        formatValue(formatCurrency(day.totalMomo)),
        formatValue(formatCurrency(day.totalRevenue)),
      ]);

      if (format === "csv") {
        const csvLines = [
          ["Metric", "Value"],
          ...summaryRows,
          [],
          ["Date", "Day", "Sales Cash", "Sales MOMO", "Service Cash", "Service MOMO", "Debt Cash", "Debt MOMO", "Daily Expenses", "Total Daily Cash", "Total Daily MOMO", "Total Daily Revenue"],
          ...breakdownRows,
        ];
        const csvContent = csvLines.map((row) => row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `sdtech-monthly-report-${selectedMonth}.csv`;
        link.click();
      } else {
        const summaryHtml = summaryRows
          .map((row: any) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`)
          .join("");
        const breakdownHtml = breakdownRows
          .map((row: any) => `<tr>${row.map((cell: unknown) => `<td>${cell}</td>`).join("")}</tr>`)
          .join("");

        const html = `
          <html>
            <head>
              <title>SD Tech Rwatano Monthly Report</title>
              <style>
                @page { size: A4 portrait; margin: 20mm; }
                body {
                  margin: 0;
                  padding: 24px;
                  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
                  color: #0f172a;
                  background: #ffffff;
                }
                .page { page-break-after: always; }
                .page:last-child { page-break-after: auto; }
                .report-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 14px;
                }
                .brand-logo {
                  display: inline-flex;
                  align-items: center;
                  gap: 10px;
                  font-size: 1.1rem;
                  font-weight: 700;
                  text-transform: uppercase;
                  color: #0f172a;
                }
                .brand-logo img {
                  height: 48px;
                  width: auto;
                  object-fit: contain;
                }
                .section-title {
                  margin: 0 0 12px;
                  font-size: 1.35rem;
                  letter-spacing: 0.01em;
                }
                .summary-text {
                  margin: 0 0 20px;
                  color: #475569;
                  line-height: 1.6;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 12px;
                  font-size: 0.92rem;
                }
                th,
                td {
                  border: 1px solid rgba(15, 23, 42, 0.12);
                  padding: 10px 12px;
                  text-align: left;
                }
                th {
                  background: #f8fafc;
                  color: #0f172a;
                  font-weight: 700;
                }
                th.parent-header {
                  background: #e2e8f0;
                  text-align: center;
                  font-weight: 700;
                }
                th.child-header {
                  background: #f1f5f9;
                  font-size: 0.9rem;
                }
                td.zero-value { color: #9ca3af; }
                td.low-value { color: #f97316; }
                td.medium-value { color: #eab308; }
                td.high-value { color: #22c55e; }
                tr:nth-child(even) {
                  background: #f8fafc;
                }
                .meta { font-size: 0.92rem; color: #475569; }
                .footer { margin-top: 28px; font-size: 0.88rem; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="page">
                <div class="report-header">
                  <div class="brand-logo">
                    <img src="${logoSrc}" alt="SD TECH" />
                    SD TECH Rwatano
                  </div>
                  <div class="meta">
                    <div>${t("reports")} - ${selectedMonth}</div>
                    <div>${new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <h1 class="section-title">Monthly Performance Summary</h1>
                <p class="summary-text">${t("reportsDescription")}</p>
                <table>
                  <thead>
                    <tr><th>${t("metric")}</th><th>${t("value")}</th></tr>
                  </thead>
                  <tbody>
                    ${summaryHtml}
                  </tbody>
                </table>
                <div class="footer">Generated by SD TECH Rwatano.</div>
              </div>
              <div class="page">
                <div class="report-header">
                  <div class="brand-logo">Monthly Breakdown</div>
                  <div class="meta">${selectedMonth}</div>
                </div>
                <h2 class="section-title">Daily Breakdown</h2>
                <table>
                  <thead>
                    <tr>
                      <th rowspan="2">Date</th>
                      <th rowspan="2">Day</th>
                      <th colspan="2" class="parent-header">Sales</th>
                      <th colspan="2" class="parent-header">Services</th>
                      <th colspan="2" class="parent-header">Debt Payments</th>
                      <th rowspan="2">Daily Expenses</th>
                      <th rowspan="2">Total Daily Cash</th>
                      <th rowspan="2">Total Daily MOMO</th>
                      <th rowspan="2">Total Daily Revenue</th>
                    </tr>
                    <tr>
                      <th class="child-header">Cash</th>
                      <th class="child-header">MOMO</th>
                      <th class="child-header">Cash</th>
                      <th class="child-header">MOMO</th>
                      <th class="child-header">Cash</th>
                      <th class="child-header">MOMO</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${breakdownRows.map((row: any) => {
                      const getValue = (val: any) => {
                        const num = parseFloat(String(val).replace(/,/g, ''));
                        if (num === 0) return 'zero-value';
                        if (num < 10000) return 'low-value';
                        if (num < 100000) return 'medium-value';
                        return 'high-value';
                      };
                      return `<tr>
                        <td>${row[0]}</td>
                        <td>${row[1]}</td>
                        <td class="${getValue(row[2])}">${row[2]}</td>
                        <td class="${getValue(row[3])}">${row[3]}</td>
                        <td class="${getValue(row[4])}">${row[4]}</td>
                        <td class="${getValue(row[5])}">${row[5]}</td>
                        <td class="${getValue(row[6])}">${row[6]}</td>
                        <td class="${getValue(row[7])}">${row[7]}</td>
                        <td class="${getValue(row[8])}">${row[8]}</td>
                        <td class="${getValue(row[9])}">${row[9]}</td>
                        <td class="${getValue(row[10])}">${row[10]}</td>
                        <td class="high-value"><strong>${row[11]}</strong></td>
                      </tr>`;
                    }).join('')}
                  </tbody>
                </table>
                <div class="footer">All daily totals include cash and MOMO payment breakdowns.</div>
              </div>
            </body>
          </html>
        `;

        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        try {
          printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
        } catch (e) {
          setTimeout(() => printWindow.print(), 700);
        }
      }
    } else {
      const rows = buildReportRows(exportMode, isOwner);
      if (format === "csv") {
        const csvContent = rows.map((row) => row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const nameSuffix = exportMode === "daily" ? selectedDate : selectedMonth;
        link.download = `sdtech-report-${exportMode}-${nameSuffix}.csv`;
        link.click();
      } else {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;

        const rowsHtml = rows
          .slice(1)
          .map((row) => `<tr>${row.map((c: unknown) => `<td>${c}</td>`).join("")}</tr>`)
          .join("");

        const html = `
          <html>
            <head>
              <title>SD Tech Rwatano Report</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <style>
                body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;padding:24px}
                .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
                .brand{font-weight:700;font-size:18px}
                table{width:100%;border-collapse:collapse;margin-top:8px}
                th,td{border:1px solid #e2e8f0;padding:10px;text-align:left}
                th{background:#f8fafc;color:#0f172a}
                tr:nth-child(even){background:#fbfdfe}
              </style>
            </head>
            <body>
              <div class="header"><div class="brand">SD TECH Rwatano</div><div>${new Date().toLocaleDateString()}</div></div>
              <h2>${t("reports")} - ${exportMode === "daily" ? selectedDate : selectedMonth}</h2>
              <p style="color:#475569">${t("reportsDescription")}</p>
              <table>
                <thead>
                  <tr><th>${t("metric")}</th><th>${t("value")}</th></tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </body>
          </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        try {
          printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
        } catch (e) {
          setTimeout(() => printWindow.print(), 700);
        }
      }
    }

    setShowExportModal(false);
  };

  const reportRows = useMemo(() => {
    const rows: any[] = [
      [t("metric"), t("value")],
      [t("dailyRevenue"), formatCurrency(metrics?.dailyRevenue)],
      [t("monthlyRevenue"), formatCurrency(metrics?.monthlyRevenue)],
      [t("netProfit"), formatCurrency(metrics?.netProfit)],
    ];

    if (isOwner) {
      rows.push([t("stockValue"), formatCurrency(metrics?.stockValue)]);
    }

    rows.push(
      [t("totalExpenses"), formatCurrency(metrics?.totalExpenses)],
      [t("debtBalance"), formatCurrency(metrics?.debtBalance)],
      [t("serviceIncome"), formatCurrency(metrics?.serviceIncome)]
    );

    return rows;
  }, [isOwner, metrics, t]);

  const handleExportExcel = () => {
    const csvContent = reportRows.map((row) => row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sdtech-report-${getLocalDateString()}.csv`;
    link.click();
  };
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const rowsHtml = reportRows
      .slice(1)
      .map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`)
      .join("");

    const html = `
      <html>
        <head>
          <title>SD Tech Rwatano Report</title>
          <style>
            @page { size: A4 portrait; margin: 24mm; }
            body {
              margin: 0;
              padding: 24px;
              font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
            }
            .report-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 20px;
              border-bottom: 1px solid rgba(15, 23, 42, 0.1);
            }
            .brand-logo {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              font-size: 1.25rem;
              font-weight: 700;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              color: #0f172a;
            }
            .brand-logo img {
              height: 56px;
              width: auto;
              border-radius: 16px;
              object-fit: contain;
            }
            .report-meta { text-align: right; font-size: 0.95rem; color: #475569; }
            h1 { margin: 16px 0 0; font-size: 2rem; }
            .summary { margin-top: 12px; margin-bottom: 24px; color: #334155; font-size: 1rem; line-height: 1.65; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.95rem; }
            th, td { border: 1px solid rgba(15, 23, 42, 0.12); padding: 12px 14px; text-align: left; }
            th { background: #fef3c7; color: #92400e; font-weight: 700; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 32px; font-size: 0.9rem; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="brand-logo">
              <img src="${logoSrc}" alt="SD TECH logo" />
              SD TECH
            </div>
            <div class="report-meta">
              <div>${t("reports")}</div>
              <div>${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <h1>${t("reports")}</h1>
          <p class="summary">${t("reportsDescription")}</p>
          <table>
            <thead>
              <tr><th>${t("metric")}</th><th>${t("value")}</th></tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">Generated by SD TECH Rwatano. Portrait-ready report layout.</div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    // ensure the document is closed and wait for rendering before printing
    printWindow.document.close();
    printWindow.focus();
    // Try to print once the new window loads; use a timeout fallback
    try {
      printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
    } catch (e) {
      setTimeout(() => printWindow.print(), 700);
    }
  };

  const [activeTab, setActiveTab] = useState<"summary" | "monthly" | "owner">("summary");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("reports")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("reportsDescription")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isOwner && (
            <button onClick={() => setShowExportModal(true)} className="btn-primary rounded-3xl px-5 py-3">{t("export")}</button>
          )}
        </div>

        {isOwner && showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowExportModal(false)} />
            <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 dark:bg-slate-900">
              <h3 className="mb-3 text-lg font-semibold">{t("exportOptions")}</h3>

              <div className="mb-3 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="exportMode" checked={exportMode === "daily"} onChange={() => setExportMode("daily")} />
                  <span className="ml-2">{t("daily")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="exportMode" checked={exportMode === "monthly"} onChange={() => setExportMode("monthly")} />
                  <span className="ml-2">{t("monthly")}</span>
                </label>
              </div>

              {exportMode === "daily" ? (
                <div className="mb-3">
                  <label className="block text-sm text-slate-600 dark:text-slate-300">{t("selectDate")}</label>
                  <input className="mt-1 w-full rounded border px-3 py-2" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
              ) : (
                <div className="mb-3">
                  <label className="block text-sm text-slate-600 dark:text-slate-300">{t("selectMonth")}</label>
                  <input
                    className="mt-1 w-full rounded border px-3 py-2"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    max={getLocalMonthString()}
                    disabled={!isOwner && selectedMonth !== getLocalMonthString()}
                  />
                  {!isOwner && selectedMonth !== getLocalMonthString() && (
                    <div className="mt-2 text-sm text-rose-600">{t("noPermission")}</div>
                  )}
                </div>
              )}

              {isOwner && (
                <label className="mb-4 flex items-center gap-2">
                  <input type="checkbox" checked={detailedForOwner} onChange={(e) => setDetailedForOwner(e.target.checked)} />
                  <span className="ml-2">{t("detailedForOwner")}</span>
                </label>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowExportModal(false)} className="btn-muted rounded px-4 py-2">{t("cancel")}</button>
                <button
                  onClick={() => handleExport("csv")}
                  className="btn-secondary rounded px-4 py-2"
                  disabled={!isOwner && exportMode === "monthly" && selectedMonth !== getLocalMonthString()}
                >
                  {t("exportExcel")}
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="btn-primary rounded px-4 py-2"
                  disabled={!isOwner && exportMode === "monthly" && selectedMonth !== getLocalMonthString()}
                >
                  {t("exportPDF")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="surface-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("reports")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("reportsDescription")}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-3 py-2 rounded transition-colors duration-150 focus:outline-none ${
                activeTab === "summary"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800/90 dark:text-slate-300 dark:hover:text-slate-100"
              }`}
            >
              Business Summary
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-3 py-2 rounded transition-colors duration-150 focus:outline-none ${
                activeTab === "monthly"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800/90 dark:text-slate-300 dark:hover:text-slate-100"
              }`}
            >
              Monthly Performance
            </button>
            <button
              onClick={() => setActiveTab("owner")}
              className={`px-3 py-2 rounded transition-colors duration-150 focus:outline-none ${
                activeTab === "owner"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800/90 dark:text-slate-300 dark:hover:text-slate-100"
              }`}
            >
              Owner Metrics
            </button>
          </div>
        </div>

        <div className="mt-4">
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            {activeTab === "summary" && <BusinessSummary metrics={metrics} />}
            {activeTab === "monthly" && <MonthlyPerformance monthlyReport={monthlyReport} />}
            {activeTab === "owner" && (isOwner ? <OwnerDecisionMetrics monthlyReport={monthlyReport} /> : <div className="p-4 text-sm text-rose-600">{t("ownerDecisionRestricted")}</div>)}
          </Suspense>
        </div>
      </div>

      {isOwner && (
        <div className="surface-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("dailyPerformanceDetails")}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("selectDailyReportDate")}</p>
            </div>
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{t("selectDate")}</label>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                type="date"
                value={selectedDate}
                max={getLocalDateString()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="surface-panel p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("dailyRevenue")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(dayMetrics?.totalRevenue ?? 0)}</p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("saleRevenue")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(dayMetrics?.salesRevenue ?? 0)}</p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("serviceRevenue")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(dayMetrics?.servicesRevenue ?? 0)}</p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("netProfit")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(dayMetrics?.netProfit ?? 0)}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full table-auto">
              <tbody>
                <tr className="bg-slate-50 dark:bg-slate-950">
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{t("totalExpenses")}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(dayMetrics?.totalExpenses ?? 0)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{t("totalCashReceived")}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(dayMetrics?.totalCash ?? 0)}</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-950">
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{t("totalMomoReceived")}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(dayMetrics?.totalMomo ?? 0)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{t("itemsSoldCount")}</td>
                  <td className="px-4 py-3 font-semibold">{dayMetrics?.itemsSoldCount ?? 0}</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-950">
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{t("lowStockCount")}</td>
                  <td className="px-4 py-3 font-semibold">{dayMetrics?.lowStockCount ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="surface-card">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("dailyRevenue")}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t("todaySalesPerformance")}</p>
          <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(metrics?.dailyRevenue)}</p>
        </div>
        <div className="surface-card">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-amber-100">{t("monthlyRevenue")}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t("currentMonthPerformance")}</p>
          <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(metrics?.monthlyRevenue)}</p>
        </div>
        <div className="surface-card">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("netProfit")}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t("revenueAfterExpenses")}</p>
          <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(metrics?.netProfit)}</p>
        </div>
      </div>

      <div className="surface-card border-emerald-200 bg-white dark:bg-slate-950 dark:border-emerald-800 rounded-[1.75rem]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("serviceRevenueThisMonth")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("allPastDatesCurrentMonth")}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-900/10 dark:text-emerald-200">
            {t("monthToDate")}: {formatCurrency(monthlyServicesTotal)}
          </div>
        </div>
        <div className="mt-6 h-56 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyServices.map((d: any) => ({ date: d.date, label: d.label, amount: d.amount }))}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value ? formatCurrency(value) : ""}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Day: ${label}`} />
              <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {monthlyServices.map((item: any) => (
            <div key={item.date} className="surface-panel p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className={`mt-2 text-lg font-semibold ${getAmountColorClass(item.amount)}`}>{formatCurrency(item.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {isOwner && (
          <div className="xl:col-span-2 surface-card">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("stockValue")}</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{t("valueOfInventory")}</p>
            <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(metrics?.stockValue)}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="surface-panel">
                <div className="text-sm text-slate-500 dark:text-slate-400">{t("totalExpenses")}</div>
                <div className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(metrics?.totalExpenses)}</div>
              </div>
              <div className="surface-panel">
                <div className="text-sm text-slate-500 dark:text-slate-400">{t("debtBalance")}</div>
                <div className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(metrics?.debtBalance)}</div>
              </div>
              <div className="surface-panel">
                <div className="text-sm text-slate-500 dark:text-slate-400">{t("serviceIncome")}</div>
                <div className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(metrics?.serviceIncome)}</div>
              </div>
            </div>
          </div>
        )}
        <div className="surface-card">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("mobileMoneyBreakdown")}</h2>
          <div className="h-44 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mobileData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={5}>
                  {mobileData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {mobileData.map((segment) => (
              <div key={segment.name} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>{segment.name.split("_").join(" ")}</span>
                <span>{formatCurrency(segment.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
