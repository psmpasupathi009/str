import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  bestSeller: boolean;
  inStock: boolean;
}

interface ProductsStore {
  products: Product[];
  categories: Array<{ id: string; name: string }>;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Array<{ id: string; name: string }>) => void;
  getProductById: (id: string) => Product | undefined;
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  categories: [],
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },
}));
