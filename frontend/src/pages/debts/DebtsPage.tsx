import { FormEvent, useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../utils/format";
import SearchableSelect from "../../components/ui/SearchableSelect";
import EditModal from "../../components/ui/EditModal";

const DebtsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [debts, setDebts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [totalOwed, setTotalOwed] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editTotalOwed, setEditTotalOwed] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [paymentModalDebt, setPaymentModalDebt] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethodState, setPaymentMethodState] = useState("CASH");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const loadDebts = async () => {
      try {
        const response = await api.get("/debts");
        setDebts(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadDebts();
  }, []);

  const handleDeleteDebt = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await api.delete(`/debts/${id}`);
      setDebts((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedDelete"));
    }
  };

  const handleEditDebt = (debt: any) => {
    setEditingDebt(debt);
    setEditCustomerName(debt.customerName || "");
    setEditCustomerPhone(debt.customerPhone || "");
    setEditTotalOwed(String(debt.totalOwed || ""));
    setEditDueDate(debt.dueDate ? new Date(debt.dueDate).toISOString().slice(0, 10) : "");
  };

  const submitEditDebt = async () => {
    if (!editingDebt) return;
    setEditLoading(true);
    try {
      const response = await api.put(`/debts/${editingDebt.id}`, {
        customerName: editCustomerName || undefined,
        customerPhone: editCustomerPhone || undefined,
        totalOwed: Number(editTotalOwed),
        dueDate: editDueDate || undefined,
      });
      setDebts((prev) => prev.map((d) => (d.id === editingDebt.id ? response.data : d)));
      setEditingDebt(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedUpdate"));
    } finally {
      setEditLoading(false);
    }
  };

  const submitPayment = async () => {
    if (!paymentModalDebt) return;
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert(t("validPaymentAmount"));
      return;
    }
    setPaymentLoading(true);
    try {
      const response = await api.post(`/debts/${paymentModalDebt.id}/payments`, {
        amount: Number(paymentAmount),
        paymentMethod: paymentMethodState,
        note: paymentNote || undefined,
      });
      // response contains { payment, debt }
      const updatedDebt = response.data.debt || response.data;
      setDebts((prev) => prev.map((d) => (d.id === updatedDebt.id ? updatedDebt : d)));
      setPaymentModalDebt(null);
      setPaymentAmount("");
      setPaymentNote("");
      setPaymentMethodState("CASH");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedRecordPayment"));
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredDebts = (() => {
    const q = searchQuery.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);
    return debts.filter((d) => {
      const created = new Date(d.createdAt);
      const matchesQuery = !q || (d.customerName || "").toString().toLowerCase().includes(q) || (d.customerPhone || "").toString().toLowerCase().includes(q);
      const matchesStatus = filterStatus === "ALL" || d.status === filterStatus;
      const matchesFrom = !from || created >= from;
      const matchesTo = !to || created <= to;
      return matchesQuery && matchesStatus && matchesFrom && matchesTo;
    });
  })();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!customerName || !customerPhone || !totalOwed || Number(totalOwed) <= 0) {
      setError(t("validCustomerDetails"));
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/debts", {
        customerName,
        customerPhone,
        totalOwed: Number(totalOwed),
        dueDate: dueDate || undefined,
      });
      setDebts((prev) => [response.data, ...prev]);
      setCustomerName("");
      setCustomerPhone("");
      setTotalOwed("");
      setDueDate("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t("failedRecordDebt"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("debts")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("trackDebts")}</p>
        </div>
      </div>

      <div className="surface-card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("newDebtRecord")}</h2>
        <form className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-4" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerName")}</label>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerPhone")}</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("amountOwed")}</label>
            <input
              type="number"
              step="0.01"
              value={totalOwed}
              onChange={(event) => setTotalOwed(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("dueDate")}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          {error && <div className="md:col-span-4 text-sm text-red-600">{error}</div>}
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-3xl px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("savingDebt") : t("saveDebt")}
            </button>
          </div>
        </form>
      </div>
      <div className="surface-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("debts")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredDebts.length} of {debts.length} debt records</p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-4">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search customer name or phone" className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3" />
            <SearchableSelect
              options={[{ value: "ALL", label: "All statuses" }, { value: "OPEN", label: "Open" }, { value: "PARTIAL", label: "Partial" }, { value: "CLOSED", label: "Closed" }]}
              value={filterStatus}
              onChange={(v) => setFilterStatus(v)}
              placeholder="All statuses"
              className="w-full"
            />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div />
          <div className="text-sm text-slate-500 dark:text-slate-400">Filters applied</div>
        </div>
        <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">{t("debtTableCustomer")}</th>
              <th className="px-4 py-3">{t("debtTableTotalOwed")}</th>
              <th className="px-4 py-3">{t("debtTableRemaining")}</th>
              <th className="px-4 py-3">{t("debtTableStatus")}</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDebts.map((debt) => (
              <tr key={debt.id} className="group border-b border-slate-200 dark:border-slate-800">
                <td className="px-4 py-4">{debt.customerName}</td>
                <td className="px-4 py-4">{formatCurrency(debt.totalOwed)}</td>
                <td className="px-4 py-4">{formatCurrency(debt.remainingAmount)}</td>
                <td className="px-4 py-4">{debt.status}</td>
                <td className="px-4 py-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-2">
                    {isOwner && (
                      <>
                        <button onClick={() => handleEditDebt(debt)} className="rounded-2xl bg-amber-500 px-3 py-2 text-white">Edit</button>
                        <button onClick={() => handleDeleteDebt(debt.id)} className="rounded-2xl bg-red-500 px-3 py-2 text-white">Delete</button>
                      </>
                    )}
                    <button onClick={() => setPaymentModalDebt(debt)} className="rounded-2xl bg-emerald-500 px-3 py-2 text-white">Add Payment</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <EditModal open={!!editingDebt} title={t("editDebt")} onClose={() => setEditingDebt(null)} onSubmit={submitEditDebt} submitLabel={t("save")} submitting={editLoading}>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("amountOwed")}</label>
            <input type="number" step="0.01" value={editTotalOwed} onChange={(e) => setEditTotalOwed(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("dueDate")}</label>
            <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
        </div>
      </EditModal>
      <EditModal open={!!paymentModalDebt} title={t("recordPayment")} onClose={() => setPaymentModalDebt(null)} onSubmit={submitPayment} submitLabel={t("savePayment")} submitting={paymentLoading}>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("amount")}</label>
            <input type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("paymentMethod")}</label>
            <SearchableSelect options={[{ value: "CASH", label: t("paymentMethodCash") }, { value: "MOMO", label: t("paymentMethodMomo") }]} value={paymentMethodState} onChange={(v) => setPaymentMethodState(v)} className="mt-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("note")}</label>
            <input value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t("existingPayments")}</h3>
            <div className="mt-2 max-h-40 overflow-auto text-sm">
              {paymentModalDebt?.payments?.length ? (
                paymentModalDebt.payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between border-b py-2">
                    <div>{new Date(p.createdAt).toLocaleString()} - {formatCurrency(p.amount)} ({p.paymentMethod || 'CASH'})</div>
                    <div className="text-slate-500">{p.note}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">{t("noPayments")}</div>
              )}
            </div>
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default DebtsPage;
