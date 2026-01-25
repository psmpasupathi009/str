import HeroSection from "@/componets/ui/hero-section";
import ProductsGrid from "@/componets/ui/products-grid";
import Testimonials from "@/componets/ui/testimonials";
import { products } from "@/lib/products";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <ProductsGrid products={products} />
      <Testimonials />
    </main>
  );
}
