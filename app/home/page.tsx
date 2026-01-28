import HeroSection from "@/components/shared/hero-section";
import BestProducts from "@/components/shared/best-products";
import CategorySection from "@/components/shared/category-section";
import { prisma } from "@/lib/prisma";

async function getBestSellerProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        bestSeller: true,
        inStock: true,
      },
      include: {
        category: true,
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      price: p.salePrice,
            image: p.image || "",
      category: p.category?.name || "",
      featured: p.featured,
      bestSeller: p.bestSeller,
    }));
  } catch (error) {
    console.error("Error fetching best seller products:", error);
    return [];
  }
}

async function getCategoriesWithProducts() {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        products: {
          where: {
            inStock: true,
          },
          take: 3,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      products: cat.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: p.salePrice,
            image: p.image || "",
        category: cat.name,
        featured: p.featured,
        bestSeller: p.bestSeller,
      })),
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function Home() {
  const [bestProducts, categoriesWithProducts] = await Promise.all([
    getBestSellerProducts(),
    getCategoriesWithProducts(),
  ]);

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-green-50">
      <HeroSection />
      {bestProducts.length > 0 && <BestProducts products={bestProducts} />}
      {categoriesWithProducts.map((categoryData: any) => {
        if (categoryData.products.length > 0) {
          return (
            <CategorySection
              key={categoryData.id}
              category={categoryData.name}
              products={categoryData.products}
              limit={3}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
