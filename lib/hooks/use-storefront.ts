import { useQuery } from "@tanstack/react-query";
import { useProductsStore } from "@/lib/stores/use-products-store";

export interface StorefrontProduct {
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

export interface StorefrontCategory {
  id: string;
  name: string;
}

interface StorefrontResponse {
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    salePrice: number;
    image: string | null;
    category: { id: string; name: string } | null;
    featured: boolean;
    bestSeller: boolean;
    inStock: boolean;
  }>;
  categories: Array<{ id: string; name: string; description?: string | null; image?: string | null }>;
}

async function fetchStorefront(): Promise<{
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
}> {
  const res = await fetch("/api/storefront", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch storefront");
  const data: StorefrontResponse = await res.json();
  const products: StorefrontProduct[] = (data.products || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: p.salePrice,
    image: p.image ?? "",
    category: p.category?.name ?? "",
    featured: p.featured,
    bestSeller: p.bestSeller,
    inStock: p.inStock,
  }));
  const categories: StorefrontCategory[] = (data.categories || []).map((c) => ({
    id: c.id,
    name: c.name,
  }));
  return { products, categories };
}

/** Single fetch for products + categories with server + client cache. Use on products page. */
export function useStorefront() {
  const { setProducts, setCategories } = useProductsStore();

  return useQuery({
    queryKey: ["storefront"],
    queryFn: fetchStorefront,
    staleTime: 60 * 1000, // 1 min - match server s-maxage
    gcTime: 5 * 60 * 1000, // 5 min
    select: (data) => {
      setProducts(data.products);
      setCategories(data.categories);
      return data;
    },
  });
}
