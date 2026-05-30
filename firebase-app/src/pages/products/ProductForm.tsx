import { FormEvent, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { createProduct, uploadProductImage, updateProduct } from "../../services/firebaseService";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types";

type ProductFormProps = {
  onCreate: (product: Product) => void;
  onUpdate: (productId: string, updates: Partial<Omit<Product, "id" | "createdAt" | "userId">>) => Promise<void>;
  selectedProduct: Product | null;
};

const categories = ["Electronics", "Accessories", "Office", "Printing", "Supplies"];

const ProductForm = ({ onCreate, onUpdate, selectedProduct }: ProductFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setName(selectedProduct.name);
      setCategory(selectedProduct.category);
      setPrice(selectedProduct.price.toString());
      setStock(selectedProduct.stock.toString());
      setDescription(selectedProduct.description || "");
      setFile(null);
    }
  }, [selectedProduct]);

  const resetForm = () => {
    setName("");
    setCategory(categories[0]);
    setPrice("");
    setStock("");
    setDescription("");
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in.");
      return;
    }
    if (!name || !price || !stock) {
      setError("Please fill in the product name, price, and stock.");
      return;
    }

    setSaving(true);

    try {
      if (selectedProduct) {
        const updates: Partial<Omit<Product, "id" | "createdAt" | "userId">> = {
          name,
          category,
          price: Number(price),
          stock: Number(stock),
          description: description || undefined,
        };

        if (file) {
          const imageUrl = await uploadProductImage(selectedProduct.id, file);
          updates.imageUrl = imageUrl;
        }

        await updateProduct(selectedProduct.id, updates);
        await onUpdate(selectedProduct.id, updates);
        resetForm();
      } else {
        const newProduct = await createProduct(user.uid, {
          name,
          category,
          price: Number(price),
          stock: Number(stock),
          description: description || undefined,
          imageUrl: undefined,
          userId: user.uid,
        });

        if (file) {
          const imageUrl = await uploadProductImage(newProduct.id, file);
          await updateProduct(newProduct.id, { imageUrl });
          newProduct.imageUrl = imageUrl;
        }

        onCreate(newProduct);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{selectedProduct ? "Edit Product" : "Add Product"}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedProduct ? "Update the product details." : "Upload a product with image and inventory details."}</p>
        </div>
        {selectedProduct && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Price</label>
          <Input type="number" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stock Quantity</label>
          <Input type="number" value={stock} onChange={(event) => setStock(event.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 focus:border-brand-500 focus:outline-none"
            rows={4}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
          />
        </div>
        {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : selectedProduct ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
