import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import type { Product } from "../types";

const productCollection = collection(db, "products");

export const getProducts = async (userId: string) => {
  const q = query(productCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Product, "id">;
    return { id: docSnap.id, ...data };
  }) as Product[];
};

export const createProduct = async (userId: string, product: Omit<Product, "id" | "createdAt">) => {
  const docRef = await addDoc(productCollection, {
    ...product,
    userId,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...product, createdAt: new Date().toISOString() } as Product;
};

const cleanData = (data: Record<string, unknown>) => {
  return Object.entries(data).reduce((result, [key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
    return result;
  }, {} as Record<string, unknown>);
};

export const updateProduct = async (productId: string, updates: Partial<Omit<Product, "id" | "createdAt" | "userId">>) => {
  const docRef = doc(db, "products", productId);
  const cleanUpdates = cleanData(updates);
  if (Object.keys(cleanUpdates).length > 0) {
    await updateDoc(docRef, cleanUpdates);
  }
};

export const deleteProduct = async (productId: string) => {
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
};

export const uploadProductImage = async (productId: string, file: File) => {
  const storageRef = ref(storage, `products/${productId}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};
