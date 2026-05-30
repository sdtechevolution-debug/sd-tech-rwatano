export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
};

export type UserProfile = {
  uid: string;
  email: string | null;
};
