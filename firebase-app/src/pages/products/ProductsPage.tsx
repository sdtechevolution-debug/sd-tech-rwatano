import { useEffect, useState } from "react";
import { Trash2, Edit3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProducts, deleteProduct, updateProduct } from "../../services/firebaseService";
import type { Product } from "../../types";
import ProductForm from "./ProductForm";

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      if (!user) return;
      const data = await getProducts(user.uid);
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, [user]);

  const handleCreate = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const handleDelete = async (productId: string) => {
    await deleteProduct(productId);
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (productId: string, updates: Partial<Omit<Product, "id" | "createdAt" | "userId">>) => {
    await updateProduct(productId, updates);
    setProducts((prev) => prev.map((item) => (item.id === productId ? { ...item, ...updates } as Product : item)));
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Products</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your product catalog and inventory.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
            Total products: {loading ? "..." : products.length}
          </div>
        </div>
      </div>

      <ProductForm onCreate={handleCreate} onUpdate={handleUpdate} selectedProduct={selectedProduct} />

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{product.description || "No description"}</p>
                  </td>
                  <td className="px-4 py-4">{product.category}</td>
                  <td className="px-4 py-4">USh {product.price.toLocaleString()}</td>
                  <td className="px-4 py-4">{product.stock}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
