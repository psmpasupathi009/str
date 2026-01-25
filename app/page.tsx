import HeroSection from "@/componets/ui/hero-section";
import BestProducts from "@/componets/ui/best-products";
import CategorySection from "@/componets/ui/category-section";
import Testimonials from "@/componets/ui/testimonials";
import {
  products,
  getBestSellerProducts,
  getProductsByCategory,
  getAllCategories,
} from "@/lib/products";

export default function Home() {
  const bestProducts = getBestSellerProducts();
  const categories = getAllCategories();

  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <BestProducts products={bestProducts} />
      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category);
        if (categoryProducts.length > 0) {
          return (
            <CategorySection
              key={category}
              category={category}
              products={categoryProducts}
              limit={3}
            />
          );
        }
        return null;
      })}
      <Testimonials />
    </main>
  );
}
