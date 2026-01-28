import { useQuery } from "@tanstack/react-query";
import { useProductsStore } from "@/lib/stores/use-products-store";

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories", {
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();
  return data.categories || [];
}

export function useCategories() {
  const { setCategories } = useProductsStore();
  
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    select: (data) => {
      // Update Zustand store
      setCategories(data);
      return data;
    },
  });
}
