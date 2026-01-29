import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const CACHE_TAG = "storefront";
const REVALIDATE_SECONDS = 60;

async function getStorefrontData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
    prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      salePrice: p.salePrice,
      image: p.image ?? "",
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      featured: p.featured,
      bestSeller: p.bestSeller,
      inStock: p.inStock,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? null,
      image: c.image ?? null,
    })),
  };
}

// GET /api/storefront - Single fetch for products + categories (public, cached)
export async function GET() {
  try {
    const cached = unstable_cache(
      getStorefrontData,
      [CACHE_TAG],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    );
    const data = await cached();

    const response = NextResponse.json(data, { status: 200 });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    return response;
  } catch (error) {
    console.error("Storefront API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch storefront data" },
      { status: 500 }
    );
  }
}
