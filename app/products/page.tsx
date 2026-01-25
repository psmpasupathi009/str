import ProductsGrid from "@/componets/ui/products-grid";
import { products } from "@/lib/products";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-black pt-16 sm:pt-20">
      <ProductsGrid products={products} />
    </main>
  );
}
