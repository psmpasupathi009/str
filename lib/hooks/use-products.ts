import { useQuery } from "@tanstack/react-query";
import { useProductsStore } from "@/lib/stores/use-products-store";

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

interface ProductsResponse {
  products: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchProducts(params?: {
  categoryId?: string;
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
  inStock?: boolean;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  if (params?.categoryId) queryParams.set("categoryId", params.categoryId);
  if (params?.category) queryParams.set("category", params.category);
  if (params?.featured) queryParams.set("featured", "true");
  if (params?.bestSeller) queryParams.set("bestSeller", "true");
  if (params?.inStock !== undefined) queryParams.set("inStock", String(params.inStock));
  if (params?.search) queryParams.set("search", params.search);
  if (params?.limit) queryParams.set("limit", String(params.limit));

  const response = await fetch(`/api/products?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data: ProductsResponse = await response.json();
  
  return (data.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.salePrice,
    image: p.image || "",
    category: p.category?.name || "",
    featured: p.featured,
    bestSeller: p.bestSeller,
    inStock: p.inStock,
  }));
}

export function useProducts(params?: {
  categoryId?: string;
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
  inStock?: boolean;
  search?: string;
  limit?: number;
}) {
  const { setProducts } = useProductsStore();
  
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Update Zustand store
      setProducts(data);
      return data;
    },
  });
}
