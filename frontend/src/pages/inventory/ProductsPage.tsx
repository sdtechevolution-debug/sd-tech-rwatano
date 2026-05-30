import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Edit2, Trash2, Search, X } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../utils/format";
import { compressImage } from "../../utils/imageCompression";
import { getStockStatusColor } from "../../utils/statusColors";
import SearchableSelect from "../../components/ui/SearchableSelect";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  barcode?: string;
  description?: string;
  stockQuantity: number;
  reorderPoint: number;
  buyPrice: number;
  sellPrice: number;
  imageUrl?: string;
  category?: Category;
};

const ProductsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [form, setForm] = useState({
    name: "",
    barcode: "",
    categoryId: "",
    description: "",
    stockQuantity: 0,
    reorderPoint: 5,
    buyPrice: "",
    sellPrice: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showRefillForm, setShowRefillForm] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [refill, setRefill] = useState({ productId: "", amount: 1 });
  const [refillLoading, setRefillLoading] = useState(false);
  const [refillError, setRefillError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredProducts = useMemo(
    () => {
      return products.filter((product) => {
        const categoryName = product.category?.name?.toLowerCase() || "";
        const matchesSearch =
          !normalizedSearchTerm ||
          product.name.toLowerCase().includes(normalizedSearchTerm) ||
          product.barcode?.toLowerCase().includes(normalizedSearchTerm) ||
          product.description?.toLowerCase().includes(normalizedSearchTerm) ||
          categoryName.includes(normalizedSearchTerm);
        const matchesCategory =
          categoryFilter === "ALL" || product.category?.id === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    },
    [normalizedSearchTerm, products, categoryFilter]
  );

  const selectedRefillProduct = products.find((product) => product.id === refill.productId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        if (categoriesResponse.data.length > 0) {
          setForm((prev) => ({ ...prev, categoryId: prev.categoryId || categoriesResponse.data[0].id }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load products and categories. Please refresh.");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (key: string, value: string) => {
    const parsedValue = ["stockQuantity", "reorderPoint"].includes(key) ? Number(value) : value;
    setForm((prev) => ({ ...prev, [key]: parsedValue }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      barcode: "",
      categoryId: categories[0]?.id || "",
      description: "",
      stockQuantity: 0,
      reorderPoint: 5,
      buyPrice: "",
      sellPrice: "",
      imageUrl: "",
    });
    setImagePreview("");
    setEditingProductId(null);
    setNewCategoryName("");
  };

  const clearSearch = () => setSearchTerm("");

  const resetRefillForm = () => {
    setRefill({
      productId: products[0]?.id || "",
      amount: 1,
    });
    setRefillError(null);
  };

  const openRefillForm = () => {
    setRefill({
      productId: products[0]?.id || "",
      amount: 1,
    });
    setShowRefillForm(true);
    setRefillError(null);
  };

  const handleRefillChange = (key: "productId" | "amount", value: string) => {
    setRefill((prev) => ({
      ...prev,
      [key]: key === "amount" ? Number(value) : value,
    }));
  };

  const handleRefillSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRefillError(null);

    if (!refill.productId || refill.amount <= 0) {
      setRefillError(t("validRefillAmount"));
      return;
    }

    const productToRefill = products.find((product) => product.id === refill.productId);
    if (!productToRefill) {
      setRefillError(t("productNotFound"));
      return;
    }

    const newStockQuantity = productToRefill.stockQuantity + Number(refill.amount);
    setRefillLoading(true);

    try {
      const response = await api.put(`/products/${refill.productId}`, {
        stockQuantity: newStockQuantity,
      });
      setProducts((prev) => prev.map((product) => (product.id === refill.productId ? response.data : product)));
      setShowRefillForm(false);
      resetRefillForm();
    } catch (err: any) {
      console.error(err);
      setRefillError(err.response?.data?.message || t("failedRefillStock"));
    } finally {
      setRefillLoading(false);
    }
  };

  const openEditForm = (product: Product) => {
    setForm({
      name: product.name,
      barcode: product.barcode || "",
      categoryId: product.category?.id || "",
      description: product.description || "",
      stockQuantity: product.stockQuantity,
      reorderPoint: product.reorderPoint,
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      imageUrl: product.imageUrl || "",
    });
    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
    }
    setEditingProductId(product.id);
    setShowForm(true);
    setError(null);
  };

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const compressedImageData = await compressImage(file);
      setForm((prev) => ({ ...prev, imageUrl: compressedImageData }));
      setImagePreview(compressedImageData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("failedProcessImage"));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.name || !form.categoryId || !form.buyPrice || !form.sellPrice) {
      setError(t("requiredProductFields"));
      setLoading(false);
      return;
    }

    try {
      let categoryIdToUse = form.categoryId;

      if (form.categoryId === "OTHER") {
        if (!newCategoryName.trim()) {
          setError("Please enter a category name for 'Other'.");
          setLoading(false);
          return;
        }

        // Create new category on the backend
        const createResp = await api.post("/categories", { name: newCategoryName.trim() });
        const createdCategory = createResp.data;
        // update local categories list and use returned id
        setCategories((prev) => [createdCategory, ...prev]);
        categoryIdToUse = createdCategory.id;
      }

      const payload = {
        name: form.name,
        barcode: form.barcode || undefined,
        categoryId: categoryIdToUse,
        description: form.description || undefined,
        stockQuantity: Number(form.stockQuantity),
        reorderPoint: Number(form.reorderPoint),
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        imageUrl: form.imageUrl || undefined,
      };

      if (editingProductId) {
        const response = await api.put(`/products/${editingProductId}`, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? response.data : p))
        );
      } else {
        const response = await api.post("/products", payload);
        setProducts((prev) => [response.data, ...prev]);
      }

      resetForm();
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          (editingProductId ? t("failedUpdateProduct") : t("failedCreateProduct"))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!window.confirm(t("confirmDeleteProduct", { name: productName }))) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t("failedDeleteProduct"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("inventory")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("inventoryDescription")}</p>
        </div>
        <div className="mt-3 md:mt-0 flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-48 pl-10 pr-10 py-2 text-sm rounded-2xl border border-slate-300 bg-slate-100 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                aria-label={t("clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="w-full md:w-40">
            <SearchableSelect
              options={[
                { value: "ALL", label: "Filter" },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              placeholder="Filter"
              className="w-full"
              inputClassName="mt-0"
            />
          </div>

          {isOwner && (
            <button
              onClick={() => {
                resetForm();
                setShowForm((s) => !s);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2 text-white hover:from-amber-500 hover:to-amber-400 transition-all duration-200 font-semibold"
            >
              {showForm ? t("closeForm") : t("addProduct")}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {fetching ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">{t("loading")}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              {products.length === 0 ? t("noProductsYet") : t("noProductsMatchSearch")}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="surface-card border-slate-200/90 dark:border-slate-800 group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
                <div className="h-32 md:h-36 bg-slate-200 dark:bg-slate-900 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img loading="lazy" src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent flex flex-col justify-end p-3">
                    <div className="grid gap-1 text-xs text-white">
                      <div className="flex items-center justify-between">
                        <span>{t("sellPrice")}:</span>
                        <span className="font-semibold">{formatCurrency(product.sellPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t("buyPrice")}:</span>
                        <span className="font-semibold">{formatCurrency(product.buyPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditForm(product)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg transition hover:bg-amber-500"
                        title={t("editProduct")}
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg transition hover:bg-red-500"
                        title={t("deleteProduct")}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{product.category?.name || t("uncategorized")}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${getStockStatusColor(product.stockQuantity, product.reorderPoint).badge}`}>
                      {product.stockQuantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isOwner && (
        <div className="fixed bottom-6 right-6 z-40 w-auto px-4 sm:px-0">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openRefillForm}
              disabled={products.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/10 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("stockRefill")}
            </button>
          </div>
        </div>
      )}

      {showRefillForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("refillStock")}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("refillDescription")}</p>
              </div>
              <button
                onClick={() => {
                  setShowRefillForm(false);
                  resetRefillForm();
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleRefillSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("refillProduct")}</label>
                <SearchableSelect
                  options={products.map(p => ({ value: p.id, label: p.name }))}
                  value={refill.productId}
                  onChange={(v) => handleRefillChange("productId", v)}
                  placeholder={t("refillProduct")}
                  className="mt-2 w-full"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("currentStock")}</label>
                  <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {selectedRefillProduct?.stockQuantity ?? 0}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("refillAmount")}</label>
                  <input
                    type="number"
                    min={1}
                    value={refill.amount}
                    onChange={(event) => handleRefillChange("amount", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
              </div>
              {refillError && <div className="text-sm text-red-600 dark:text-red-400">{refillError}</div>}
              <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowRefillForm(false);
                    resetRefillForm();
                  }}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {t("closeForm")}
                </button>
                <button
                  type="submit"
                  disabled={refillLoading}
                  className="rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-3 text-white hover:from-amber-500 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-50 font-semibold transition-all duration-200"
                >
                  {refillLoading ? t("savingProduct") : t("stockRefill")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {editingProductId ? t("saveProduct") : t("addProduct")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editingProductId ? t("editProductDescription") : t("inventoryDescription")}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("productName")}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("productCategory")}</label>
                <SearchableSelect
                  options={[...categories.map(c => ({ value: c.id, label: c.name })), { value: "OTHER", label: t("other") }]}
                  value={form.categoryId}
                  onChange={(v) => handleChange("categoryId", v)}
                  placeholder={t("productCategory")}
                  className="mt-2 w-full"
                />
                {form.categoryId === "OTHER" && (
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("newCategoryNamePlaceholder")}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-500 focus:outline-none"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("barcode")}</label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(event) => handleChange("barcode", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("imageUrl")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Upload a product photo from your device.</p>
                {imagePreview && (
                  <div className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <img src={imagePreview} alt="Preview" className="h-32 md:h-40 w-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("buyPrice")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.buyPrice}
                  onChange={(event) => handleChange("buyPrice", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("sellPrice")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.sellPrice}
                  onChange={(event) => handleChange("sellPrice", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("stockQuantity")}</label>
                <input
                  type="number"
                  value={form.stockQuantity}
                  onChange={(event) => handleChange("stockQuantity", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("reorderPoint")}</label>
                <input
                  type="number"
                  value={form.reorderPoint}
                  onChange={(event) => handleChange("reorderPoint", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("description")}</label>
                <textarea
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                  rows={3}
                />
              </div>
              {error && <div className="md:col-span-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3 text-white hover:from-amber-500 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-50 font-semibold transition-all duration-200"
                >
                  {loading ? t("savingProduct") : editingProductId ? t("saveProduct") : t("saveProduct")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
