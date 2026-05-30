import { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, TrendingUp, ShoppingCart, Package, Calendar, DollarSign, Smartphone } from "lucide-react";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../utils/format";

const DashboardPage = () => {
  const [todayMetrics, setTodayMetrics] = useState<any>(null);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [todayRes, weeklyRes] = await Promise.all([
          api.get("/analytics/today"),
          api.get("/analytics/weekly")
        ]);
        setTodayMetrics(todayRes.data);
        setWeekly(weeklyRes.data.days || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t("todaysOverview")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{today}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">{t("loadingData")}</p>
        </div>
      ) : (
        <>
          {/* Today's Revenue Summary */}
          <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-3">
            <div className="surface-card border-emerald-200 dark:border-emerald-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t("servicesRevenue")}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.servicesRevenue ?? 0)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <div className="flex items-center justify-between gap-2">
                  <span>Cash</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.servicesCash ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span>Momo</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.servicesMomo ?? 0)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t("fromServicesToday")}</p>
            </div>

            <div className="surface-card border-blue-200 dark:border-blue-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t("productsRevenue")}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.salesRevenue ?? 0)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <div className="flex items-center justify-between gap-2">
                  <span>Cash</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.salesCash ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span>Momo</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.salesMomo ?? 0)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t("fromProductsToday")}</p>
            </div>

            <div className="surface-card border-amber-200 dark:border-amber-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t("totalRevenueToday")}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.totalRevenue ?? 0)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <div className="flex items-center justify-between gap-2">
                  <span>Cash</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.totalCash ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Debt</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.debt ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span>Momo</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(todayMetrics?.totalMomo ?? 0)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t("servicesProductsCombined")}</p>
            </div>
          </div>

          {/* Products Sold & Low Stock */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Products Sold */}
            <div className="surface-card border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("productsSoldToday")}</h2>
              </div>
              <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{todayMetrics?.itemsSoldCount ?? 0} items</p>
              <div className="space-y-3">
                {(todayMetrics?.soldProducts || []).slice(0, 5).map((product: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{product.quantity} sold</p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(product.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className={`surface-card ${
              (todayMetrics?.lowStockCount ?? 0) > 0 
                ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30" 
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className={`h-5 w-5 ${(todayMetrics?.lowStockCount ?? 0) > 0 ? "text-red-600" : "text-slate-600"}`} />
                <h2 className={`text-lg font-semibold ${(todayMetrics?.lowStockCount ?? 0) > 0 ? "text-red-900 dark:text-red-100" : "text-slate-900 dark:text-slate-100"}`}>
                  {t("stockStatus")}
                </h2>
              </div>
              <p className={`text-3xl font-semibold mb-4 ${(todayMetrics?.lowStockCount ?? 0) > 0 ? "text-red-900 dark:text-red-100" : "text-slate-900 dark:text-slate-100"}`}>
                {t("itemsLow", { count: todayMetrics?.lowStockCount ?? 0 })}
              </p>
              {(todayMetrics?.lowStockCount ?? 0) > 0 && (
                <div className="space-y-2">
                  {todayMetrics.lowStockItems.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-3xl bg-white p-3 dark:bg-slate-900">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">Stock: {item.stockQuantity}/{item.reorderPoint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Performance Chart */}
          <div className="surface-card border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t("weekPerformanceTrend")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t("last7Days")}</p>
            <div className="h-56 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly.map((d) => ({ date: d.date.slice(5), sales: d.salesRevenue, services: d.servicesRevenue }))}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name={t("inventory")} />
                  <Line type="monotone" dataKey="services" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name={t("services")} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default DashboardPage;
