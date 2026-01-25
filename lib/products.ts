export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  images?: string[];
  details?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Watch",
    description:
      "With its flawless performance and superior craftsmanship, this distinguished masterpiece was designed to exhilarate.",
    price: 2500,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop",
    ],
    details:
      "Crafted with precision and attention to detail, this timepiece represents the pinnacle of luxury watchmaking.",
  },
  {
    id: "2",
    name: "Designer Handbag",
    description:
      "Choose from our exclusive collections or collaborate with our craftspeople and designers to create something wholly unique to you.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=600&fit=crop",
    ],
    details:
      "A confluence of exceptional and extraordinary narratives, as revealed by our master craftspeople.",
  },
  {
    id: "3",
    name: "Luxury Sunglasses",
    description:
      "A confluence of exceptional and extraordinary narratives, as revealed by our design philosophy.",
    price: 850,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop",
    ],
    details:
      "Protect your eyes with style. These premium sunglasses combine fashion and function seamlessly.",
  },
  {
    id: "4",
    name: "Premium Leather Jacket",
    description:
      "With its flawless performance and superior craftsmanship, this distinguished masterpiece was designed to exhilarate.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
    category: "Apparel",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop",
    ],
    details:
      "Handcrafted from the finest leather, this jacket is a statement piece that will last a lifetime.",
  },
  {
    id: "5",
    name: "Designer Shoes",
    description:
      "Choose from our exclusive collections or collaborate with our craftspeople and designers to create something wholly unique to you.",
    price: 1200,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop",
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=600&fit=crop",
    ],
    details:
      "Step into luxury with these meticulously crafted designer shoes, combining comfort and style.",
  },
  {
    id: "6",
    name: "Luxury Perfume",
    description:
      "A confluence of exceptional and extraordinary narratives, as revealed by our master perfumers.",
    price: 450,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
    category: "Fragrance",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1595425970377-c970d3c0e3f0?w=800&h=600&fit=crop",
    ],
    details:
      "An exquisite fragrance that captures the essence of luxury and sophistication.",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}
