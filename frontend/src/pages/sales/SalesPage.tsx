import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/format";
import SearchableSelect from "../../components/ui/SearchableSelect";
import EditModal from "../../components/ui/EditModal";

type SaleItemForm = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type Product = {
  id: string;
  name: string;
  sellPrice: number;
  stockQuantity: number;
};

const SalesPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [taxAmount, setTaxAmount] = useState("0");
  const [amountPaid, setAmountPaid] = useState("");
  const [items, setItems] = useState<SaleItemForm[]>([{ productId: "", quantity: 1, unitPrice: 0 }] );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [editingSale, setEditingSale] = useState<any | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("CASH");
  const [editTaxAmount, setEditTaxAmount] = useState("0");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [salesResponse, productsResponse] = await Promise.all([api.get("/sales"), api.get("/products")]);
        setSales(salesResponse.data);
        setProducts(productsResponse.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  const handleDeleteSale = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await api.delete(`/sales/${id}`);
      setSales((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedDelete"));
    }
  };

  const handleEditSale = (sale: any) => {
    setEditingSale(sale);
    setEditCustomerName(sale.customerName || "");
    setEditCustomerPhone(sale.customerPhone || "");
    setEditPaymentMethod(sale.paymentMethod || "CASH");
    setEditTaxAmount(String(sale.taxAmount || 0));
  };

  const submitEditSale = async () => {
    if (!editingSale) return;
    setEditLoading(true);
    try {
      const response = await api.put(`/sales/${editingSale.id}`, { customerName: editCustomerName || undefined, customerPhone: editCustomerPhone || undefined, paymentMethod: editPaymentMethod, taxAmount: Number(editTaxAmount) || 0 });
      setSales((prev) => prev.map((s) => (s.id === editingSale.id ? response.data : s)));
      setEditingSale(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedUpdate"));
    } finally {
      setEditLoading(false);
    }
  };

  const totalAmount = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return subtotal + Number(taxAmount || 0);
  }, [items, taxAmount]);

  const filteredSales = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const fromDateValue = dateFrom ? new Date(dateFrom) : null;
    const toDateValue = dateTo ? new Date(dateTo) : null;
    if (toDateValue) toDateValue.setHours(23, 59, 59, 999);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      const saleId = sale.id?.toString().toLowerCase() || "";
      const customer = (sale.customerName || sale.customerPhone || "").toString().toLowerCase();
      const payment = (sale.paymentMethod || "").toString().toLowerCase();
      const amount = formatCurrency(sale.totalAmount).toLowerCase();
      const saleDateString = saleDate.toLocaleDateString().toLowerCase();

      const worker = (sale.user?.name || sale.user?.email || "").toString().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        saleId.includes(normalizedQuery) ||
        customer.includes(normalizedQuery) ||
        worker.includes(normalizedQuery) ||
        payment.includes(normalizedQuery) ||
        amount.includes(normalizedQuery) ||
        saleDateString.includes(normalizedQuery);

      const matchesPayment =
        filterPaymentMethod === "ALL" || sale.paymentMethod === filterPaymentMethod;

      const matchesFrom = !fromDateValue || saleDate >= fromDateValue;
      const matchesTo = !toDateValue || saleDate <= toDateValue;

      return matchesQuery && matchesPayment && matchesFrom && matchesTo;
    });
  }, [sales, searchQuery, filterPaymentMethod, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterPaymentMethod("ALL");
    setDateFrom("");
    setDateTo("");
  };

  const handleItemChange = (index: number, key: keyof SaleItemForm, value: string | number) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [key]: value } as SaleItemForm;
        if (key === "productId" && typeof value === "string") {
          const product = products.find((product) => product.id === value);
          if (product) {
            updated.unitPrice = product.sellPrice;
          }
        }
        return updated;
      })
    );
  };

  const addLineItem = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const validItems = items.filter((item) => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      setError(t("pleaseAddAtLeastOneProduct"));
      setLoading(false);
      return;
    }

    try {
      const paidAmount = amountPaid.trim() ? Number(amountPaid) : totalAmount;
      if (paidAmount < 0 || paidAmount > totalAmount) {
        setError(t("validPaymentAmount"));
        setLoading(false);
        return;
      }
      if (paidAmount < totalAmount && (!customerName.trim() || !customerPhone.trim())) {
        setError(t("validCustomerDetails"));
        setLoading(false);
        return;
      }

      const response = await api.post("/sales", {
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        paymentMethod,
        amountPaid,
        taxAmount: Number(taxAmount) || 0,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      setSales((prev) => [response.data, ...prev]);
      setCustomerName("");
      setCustomerPhone("");
      setAmountPaid("");
      setTaxAmount("0");
      setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t("failedRecordSale"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("sales")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("newSale")}</p>
        </div>
      </div>

      <div className="surface-card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("newSale")}</h2>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerName")}</label>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder={t("walkIn")}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerPhone")}</label>
              <input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder={t("customerPhone")}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("taxFees")}</label>
              <input
                type="number"
                step="0.01"
                value={taxAmount}
                onChange={(event) => setTaxAmount(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("paymentMethod")}</label>
              <SearchableSelect
                options={[{ value: "CASH", label: t("paymentMethodCash") }, { value: "MOMO", label: t("paymentMethodMomo") }]}
                value={paymentMethod}
                onChange={(v) => setPaymentMethod(v)}
                placeholder={t("paymentMethod")}
                className="mt-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Paid Amount</label>
              <input
                type="number"
                step="0.01"
                value={amountPaid}
                onChange={(event) => setAmountPaid(event.target.value)}
                placeholder="Leave blank to pay full amount"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
              />
            </div>
            <div className="flex items-end justify-end">
              <div className="text-right text-sm text-slate-500 dark:text-slate-400">{t("totalDueIncludingTax")}</div>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="surface-panel grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-end p-3 sm:p-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("product")}</label>
                  <SearchableSelect
                    options={[{ value: "", label: t("product") }, ...products.map(p => ({ value: p.id, label: `${p.name} (${p.stockQuantity} in stock)` }))]}
                    value={item.productId}
                    onChange={(v) => handleItemChange(index, "productId", v)}
                    placeholder={t("product")}
                    className="mt-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("quantity")}</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => handleItemChange(index, "quantity", Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("unitPrice")}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) => handleItemChange(index, "unitPrice", Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="rounded-2xl bg-red-500 px-3 py-2 text-white hover:bg-red-600 w-full sm:w-auto"
                >
                  {t("remove")}
                </button>
              </div>
            ))}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={addLineItem} className="btn-secondary rounded-3xl px-4 py-3">
              {t("addProduct")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-3xl px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("savingSale") : t("saveSale")}
            </button>
            <div className="ml-auto text-right text-sm text-slate-500 dark:text-slate-400">
              Total: {formatCurrency(totalAmount)}
            </div>
          </div>
        </form>
      </div>
      <div className="surface-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("sales")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredSales.length} of {sales.length} sales records.</p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sale ID, customer, worker, payment or date"
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            />
            <SearchableSelect
              options={[{ value: "ALL", label: "All payment methods" }, { value: "CASH", label: t("paymentMethodCash") }, { value: "MOMO", label: t("paymentMethodMomo") }]}
              value={filterPaymentMethod}
              onChange={(v) => setFilterPaymentMethod(v)}
              placeholder="All payment methods"
              className="w-full"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="btn-secondary rounded-3xl px-4 py-3"
          >
            Clear filters
          </button>
          {searchQuery || filterPaymentMethod !== "ALL" || dateFrom || dateTo ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">Active filters applied</div>
          ) : null}
        </div>
        <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">{t("salesTableSaleId")}</th>
              <th className="px-4 py-3">{t("salesTableCustomer")}</th>
              <th className="px-4 py-3">{t("salesTableWorker")}</th>
              <th className="px-4 py-3">{t("salesTableTotal")}</th>
              <th className="px-4 py-3">{t("paymentMethod")}</th>
              <th className="px-4 py-3">{t("salesTableProfit")}</th>
              <th className="px-4 py-3">{t("salesTableDate")}</th>
              {isOwner && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="group border-b border-slate-200 dark:border-slate-800">
                <td className="px-4 py-4">{sale.id.slice(0, 8)}</td>
                <td className="px-4 py-4">{sale.customerName || t("walkIn")}</td>
                <td className="px-4 py-4">{sale.user?.name || sale.user?.email || "—"}</td>
                <td className="px-4 py-4">{formatCurrency(sale.totalAmount)}</td>
                <td className="px-4 py-4">{sale.paymentMethod === "MOMO" ? t("paymentMethodMomo") : t("paymentMethodCash")}</td>
                <td className="px-4 py-4">{formatCurrency(sale.totalProfit)}</td>
                <td className="px-4 py-4">{new Date(sale.createdAt).toLocaleDateString()}</td>
                {isOwner && (
                  <td className="px-4 py-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-2">
                      <button onClick={() => handleEditSale(sale)} className="rounded-2xl bg-amber-500 px-3 py-2 text-white">Edit</button>
                      <button onClick={() => handleDeleteSale(sale.id)} className="rounded-2xl bg-red-500 px-3 py-2 text-white">Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <EditModal open={!!editingSale} title={t("editSale")} onClose={() => setEditingSale(null)} onSubmit={submitEditSale} submitLabel={t("save")} submitting={editLoading}>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerName")}</label>
            <input value={editCustomerName} onChange={(e) => setEditCustomerName(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerPhone")}</label>
            <input value={editCustomerPhone} onChange={(e) => setEditCustomerPhone(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("paymentMethod")}</label>
            <SearchableSelect options={[{ value: "CASH", label: t("paymentMethodCash") }, { value: "MOMO", label: t("paymentMethodMomo") }]} value={editPaymentMethod} onChange={(v) => setEditPaymentMethod(v)} className="mt-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("taxFees")}</label>
            <input type="number" step="0.01" value={editTaxAmount} onChange={(e) => setEditTaxAmount(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default SalesPage;
