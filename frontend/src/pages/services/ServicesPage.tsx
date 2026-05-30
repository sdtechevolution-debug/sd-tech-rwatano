import { FormEvent, useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../utils/format";
import SearchableSelect from "../../components/ui/SearchableSelect";
import EditModal from "../../components/ui/EditModal";

const ServicesPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [category, setCategory] = useState("PRINTING");
  const [otherCategoryName, setOtherCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [debtCustomerName, setDebtCustomerName] = useState("");
  const [debtCustomerPhone, setDebtCustomerPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editingService, setEditingService] = useState<any | null>(null);
  const [editServiceAmount, setEditServiceAmount] = useState("");
  const [editServiceDescription, setEditServiceDescription] = useState("");
  const [editServiceLoading, setEditServiceLoading] = useState(false);

  const defaultServiceCategories = [
    "PRINTING",
    "PHOTOCOPY",
    "SCANNING",
    "TYPING",
    "INTERNET",
    "MOBILE_MONEY",
    "AIRTIME_SIM",
  ];

  const serviceCategories = (() => {
    const fromServices = services.map((s) => s.category).filter(Boolean);
    const set = new Set([...defaultServiceCategories, ...fromServices]);
    return Array.from(set);
  })();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get("/services");
        setServices(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadServices();
  }, []);

  const handleDeleteService = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedDelete"));
    }
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setEditServiceAmount(String(service.amount || ""));
    setEditServiceDescription(service.description || "");
  };

  const submitEditService = async () => {
    if (!editingService) return;
    setEditServiceLoading(true);
    try {
      const response = await api.put(`/services/${editingService.id}`, {
        amount: Number(editServiceAmount),
        description: editServiceDescription || undefined,
      });
      setServices((prev) => prev.map((s) => (s.id === editingService.id ? response.data : s)));
      setEditingService(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedUpdate"));
    } finally {
      setEditServiceLoading(false);
    }
  };

  const filteredServices = (() => {
    const q = searchQuery.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return services.filter((s) => {
      const serviceDate = new Date(s.createdAt);
      const matchesQuery =
        !q ||
        (s.category || "").toString().toLowerCase().includes(q) ||
        (s.description || "").toString().toLowerCase().includes(q) ||
        (s.user?.name || "").toString().toLowerCase().includes(q);
      const matchesCategory = !filterCategory || filterCategory === "ALL" || s.category === filterCategory;
      const matchesPayment = filterPaymentMethod === "ALL" || s.paymentMethod === filterPaymentMethod;
      const matchesFrom = !from || serviceDate >= from;
      const matchesTo = !to || serviceDate <= to;
      return matchesQuery && matchesCategory && matchesPayment && matchesFrom && matchesTo;
    });
  })();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!amount || Number(amount) <= 0) {
      setError(t("validServiceAmount"));
      setLoading(false);
      return;
    }

    try {
      // If user provided an "Other" service name, normalize it to match existing pattern
      const categoryToSend = category === "OTHER" && otherCategoryName.trim()
        ? otherCategoryName.trim().toUpperCase().replace(/\s+/g, "_")
        : category;

      if (category === "OTHER" && !otherCategoryName.trim()) {
        setError(t("otherServiceTypeName"));
        setLoading(false);
        return;
      }

      const paid = amountPaid.trim() ? Number(amountPaid) : Number(amount);
      if (paid < 0 || paid > Number(amount)) {
        setError(t("validPaymentAmount"));
        setLoading(false);
        return;
      }

      const servicePayload: any = {
        category: categoryToSend,
        description: description || undefined,
        paymentMethod,
        amount: Number(amount),
        amountPaid: paid,
      };

      if (paid < Number(amount)) {
        if (!debtCustomerName.trim() || !debtCustomerPhone.trim()) {
          setError(t("validCustomerDetails"));
          setLoading(false);
          return;
        }
        servicePayload.customerName = debtCustomerName.trim();
        servicePayload.customerPhone = debtCustomerPhone.trim();
      }

      const response = await api.post("/services", servicePayload);
      setServices((prev) => [response.data, ...prev]);

      if (paid < Number(amount)) {
        setDebtCustomerName("");
        setDebtCustomerPhone("");
      }
      setAmountPaid("");
      setDescription("");
      setAmount("");
      setOtherCategoryName("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t("failedSaveService"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("services")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("servicesPageDescription")}</p>
        </div>
      </div>

      <div className="surface-card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("recordService")}</h2>
        <form className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("serviceType")}</label>
            <SearchableSelect
              options={[...serviceCategories.map(c => ({ value: c, label: c.split("_").join(" ") })), { value: "OTHER", label: t("other") }]}
              value={category}
              onChange={(v) => setCategory(v)}
              placeholder={t("serviceType")}
              className="mt-2 w-full"
            />
            {category === "OTHER" && (
              <input
                type="text"
                value={otherCategoryName}
                onChange={(e) => setOtherCategoryName(e.target.value)}
                placeholder={t("newServiceTypePlaceholder")}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-500 focus:outline-none"
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
              placeholder={t("serviceDetailsPlaceholder")}
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("amountPaid") || "Paid Amount"}</label>
            <input
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none"
              placeholder={t("fullPaymentPlaceholder") || "Leave blank for full payment"}
            />
          </div>
          {Number(amountPaid || amount) < Number(amount) && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerName")}</label>
                <input value={debtCustomerName} onChange={(e) => setDebtCustomerName(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("customerPhone")}</label>
                <input value={debtCustomerPhone} onChange={(e) => setDebtCustomerPhone(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
              </div>
            </>
          )}
          {error && <div className="md:col-span-3 text-sm text-red-600">{error}</div>}
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-3xl px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("savingService") : t("saveService")}
            </button>
          </div>
        </form>
      </div>
      <div className="surface-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("services")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredServices.length} of {services.length} services</p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-5">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search category, description or worker" className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3" />
            <SearchableSelect
              options={[{ value: "ALL", label: "All categories" }, ...serviceCategories.map(c => ({ value: c, label: c.split("_").join(" ") }))]}
              value={filterCategory}
              onChange={(v) => setFilterCategory(v)}
              placeholder="All categories"
              className="w-full"
            />
            <SearchableSelect
              options={[{ value: "ALL", label: "All payment methods" }, { value: "CASH", label: t("paymentMethodCash") }, { value: "MOMO", label: t("paymentMethodMomo") }]}
              value={filterPaymentMethod}
              onChange={(v) => setFilterPaymentMethod(v)}
              placeholder="All payment methods"
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
              <th className="px-4 py-3">{t("serviceTableService")}</th>
              <th className="px-4 py-3">{t("serviceTableAmount")}</th>
              <th className="px-4 py-3">{t("serviceTablePayment")}</th>
              <th className="px-4 py-3">{t("serviceTableWorker")}</th>
              <th className="px-4 py-3">{t("serviceTableDate")}</th>
              {isOwner && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id} className="group border-b border-slate-200 dark:border-slate-800">
                <td className="px-4 py-4">{service.category.replaceAll("_", " ")}</td>
                <td className="px-4 py-4">{formatCurrency(service.amount)}</td>
                <td className="px-4 py-4">{service.paymentMethod === "MOMO" ? t("paymentMethodMomo") : t("paymentMethodCash")}</td>
                <td className="px-4 py-4">{service.user?.name}</td>
                <td className="px-4 py-4">{new Date(service.createdAt).toLocaleDateString()}</td>
                {isOwner && (
                  <td className="px-4 py-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-2">
                      <button onClick={() => handleEditService(service)} className="rounded-2xl bg-amber-500 px-3 py-2 text-white">Edit</button>
                      <button onClick={() => handleDeleteService(service.id)} className="rounded-2xl bg-red-500 px-3 py-2 text-white">Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <EditModal open={!!editingService} title={t("editService")} onClose={() => setEditingService(null)} onSubmit={submitEditService} submitLabel={t("save")} submitting={editServiceLoading}>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("amount")}</label>
            <input type="number" step="0.01" value={editServiceAmount} onChange={(e) => setEditServiceAmount(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("description")}</label>
            <input value={editServiceDescription} onChange={(e) => setEditServiceDescription(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-500 focus:outline-none" />
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default ServicesPage;
