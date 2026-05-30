import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../services/firebaseService";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types";

const DashboardPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const items = await getProducts(user.uid);
      setProducts(items);
      setLoading(false);
    };
    load();
  }, [user]);

  const totalValue = useMemo(
    () => products.reduce((sum, product) => sum + product.price * product.stock, 0),
    [products]
  );

  const totalProducts = products.length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Overview of your stock and product catalog.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total products</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{loading ? "..." : totalProducts}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Current stock value</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">USh {loading ? "..." : totalValue.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Latest product</p>
          <p className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">{loading ? "..." : products[0]?.name || "No items yet"}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
