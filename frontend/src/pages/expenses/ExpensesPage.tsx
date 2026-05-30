import { FormEvent, useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../utils/format";
import SearchableSelect from "../../components/ui/SearchableSelect";
import EditModal from "../../components/ui/EditModal";

const expenseCategories = [
  "ELECTRICITY",
  "INTERNET",
  "TRANSPORT",
  "RENT",
  "SALARY",
  "MAINTENANCE",
  "SUPPLIES",
];

const ExpensesPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";

  const [expenses, setExpenses] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("ELECTRICITY");
  const [newCategory, setNewCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await api.get("/expenses");
        setExpenses(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadExpenses();
  }, []);

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedDelete"));
    }
  };

  const categoryOptions = [
    ...expenseCategories.map((c) => ({ value: c, label: c.split("_").join(" ") })),
    { value: "OTHER", label: t("other") },
  ];

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setEditCategory(expense.category || "");
    setEditDescription(expense.description || "");
    setEditAmount(String(expense.amount || ""));
  };

  const submitEditExpense = async () => {
    if (!editingExpense) return;
    setEditLoading(true);
    try {
      const response = await api.put(`/expenses/${editingExpense.id}`, { category: editCategory, description: editDescription || undefined, amount: Number(editAmount) });
      setExpenses((prev) => prev.map((e) => (e.id === editingExpense.id ? response.data : e)));
      setEditingExpense(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedUpdate"));
    } finally {
      setEditLoading(false);
    }
  };

  const filteredExpenses = (() => {
    const q = searchQuery.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);
    return expenses.filter((exp) => {
      const d = new Date(exp.createdAt);
      const matchesQuery = !q || (exp.description || "").toString().toLowerCase().includes(q) || (exp.user?.name || "").toString().toLowerCase().includes(q);
      const matchesCategory = !filterCategory || filterCategory === "ALL" || exp.category === filterCategory;
      const matchesFrom = !from || d >= from;
      const matchesTo = !to || d <= to;
      return matchesQuery && matchesCategory && matchesFrom && matchesTo;
    });
  })();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!amount || Number(amount) <= 0) {
      setError(t("validExpenseAmount"));
      setLoading(false);
      return;
    }

    // Save category as the enum value 'OTHER' when user supplies a custom name.
    const finalCategory = category === "OTHER" ? "OTHER" : category;
    // If user provided a custom name, include it in the description only (do not auto-save as category)
    const combinedDescription = newCategory.trim() ? `${newCategory.trim()}${description ? ' - ' + description : ''}` : description || undefined;

    try {
      const response = await api.post("/expenses", {
        category: finalCategory,
        description: combinedDescription,
        amount: Number(amount),
      });
      setExpenses((prev) => [response.data, ...prev]);
      setDescription("");
      setAmount("");
      setCategory(finalCategory);
      setNewCategory("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t("failedSaveExpense"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("expenses")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("trackExpenses")}</p>
        </div>
      </div>

      <div className="surface-card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("recordExpense")}</h2>
        <form className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("expenseTableCategory")}</label>
            <SearchableSelect
              options={categoryOptions}
              value={category}
              onChange={(v) => {
                setCategory(v);
                if (v !== "OTHER") setNewCategory("");
              }}
              placeholder={t("expenseTableCategory")}
              className="mt-2 w-full"
            />
            {category === "OTHER" && (
              <input
                type="text"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
                placeholder={t("otherServiceTypeName")}
              />
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("description")}</label>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
              placeholder={t("expenseDescriptionPlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("amount")}</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>
          {error && <div className="md:col-span-3 text-sm text-red-600">{error}</div>}
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-3xl px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("savingExpense") : t("saveExpense")}
            </button>
          </div>
        </form>
      </div>
      <div className="surface-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("expenses")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredExpenses.length} of {expenses.length} expense records</p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-4">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search description or recorded by" className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3" />
            <SearchableSelect
              options={[
                { value: "ALL", label: "All categories" },
                ...expenseCategories.map((c) => ({ value: c, label: c.split("_").join(" ") })),
                { value: "OTHER", label: t("other") },
              ]}
              value={filterCategory}
              onChange={(v) => setFilterCategory(v)}
              placeholder="All categories"
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
              <th className="px-4 py-3">{t("expenseTableCategory")}</th>
              <th className="px-4 py-3">{t("expenseTableAmount")}</th>
              <th className="px-4 py-3">{t("expenseTableRecordedBy")}</th>
              <th className="px-4 py-3">{t("expenseTableDate")}</th>
              {isOwner && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="group border-b border-slate-200 dark:border-slate-800">
                <td className="px-4 py-4">{expense.category}</td>
                <td className="px-4 py-4">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-4">{expense.user?.name}</td>
                <td className="px-4 py-4">{new Date(expense.createdAt).toLocaleDateString()}</td>
                {isOwner && (
                  <td className="px-4 py-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-2">
                      <button onClick={() => handleEditExpense(expense)} className="rounded-2xl bg-amber-500 px-3 py-2 text-white">Edit</button>
                      <button onClick={() => handleDeleteExpense(expense.id)} className="rounded-2xl bg-red-500 px-3 py-2 text-white">Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
+      <EditModal open={!!editingExpense} title={t("editExpense")} onClose={() => setEditingExpense(null)} onSubmit={submitEditExpense} submitLabel={t("save")} submitting={editLoading}>
+        <div className="grid gap-4">
+          <div>
+            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("expenseTableCategory")}</label>
+            <SearchableSelect options={expenseCategories.map(c => ({ value: c, label: c.split("_").join(" ") }))} value={editCategory} onChange={(v) => setEditCategory(v)} className="mt-2 w-full" />
+          </div>
+          <div>
+            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("description")}</label>
+            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
+          </div>
+          <div>
+            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("amount")}</label>
+            <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
+          </div>
+        </div>
+      </EditModal>
    </div>
  );
};

export default ExpensesPage;
