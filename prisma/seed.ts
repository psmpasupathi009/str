import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductData {
  "Product Name": string;
  "CATEGORY": string;
  "ITEM CODE": string;
  "Weight": string;
  "MRP": number;
  "SALE PRICE": number;
  "GST": number;
  "HSN CODE": string | number;
  "Image"?: string;
  "Description"?: string;
  "Featured"?: boolean;
  "Best Seller"?: boolean;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'product list online.json');
  let jsonContent = fs.readFileSync(jsonPath, 'utf-8').trim();
  
  // Handle different JSON formats
  let products: ProductData[] = [];
  try {
    const parsed = JSON.parse(jsonContent);
    
    // If it's an array, use it directly
    if (Array.isArray(parsed)) {
      products = parsed;
    }
    // If it's an object, check for data or products property
    else if (typeof parsed === 'object' && parsed !== null) {
      products = parsed.data || parsed.products || [];
    }
    else {
      throw new Error('Invalid JSON format: expected array or object with data/products property');
    }
  } catch (error: any) {
    console.error('❌ Error parsing JSON file:', error.message);
    console.error('Attempting to fix JSON format...');
    
    // Try to fix the JSON by ensuring it's a valid array
    try {
      // Remove trailing comma if present
      jsonContent = jsonContent.replace(/,\s*$/, '');
      // Ensure it's wrapped in array brackets
      if (!jsonContent.trim().startsWith('[')) {
        jsonContent = '[' + jsonContent.trim();
      }
      if (!jsonContent.trim().endsWith(']')) {
        jsonContent = jsonContent.trim() + ']';
      }
      const parsed = JSON.parse(jsonContent);
      products = Array.isArray(parsed) ? parsed : [];
    } catch (fixError: any) {
      console.error('❌ Failed to fix JSON:', fixError.message);
      throw new Error('Invalid JSON format. Please check the file structure.');
    }
  }

  console.log(`📦 Found ${products.length} products to import`);

  // Get unique categories (trim whitespace)
  const uniqueCategories = [...new Set(products.map(p => (p.CATEGORY || "").trim()).filter(c => c))];
  console.log(`📂 Found ${uniqueCategories.length} unique categories`);

  // Create categories
  const categoryMap = new Map<string, string>();
  for (const categoryName of uniqueCategories) {
    const category = await prisma.productCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        description: `${categoryName} products`,
      },
    });
    categoryMap.set(categoryName, category.id);
    console.log(`✅ Created/Updated category: ${categoryName}`);
  }

  // Create products
  let created = 0;
  let updated = 0;
  for (const productData of products) {
    // Trim product name and category first
    const productName = (productData["Product Name"] || "").trim();
    const category = (productData.CATEGORY || "").trim();
    
    if (!productName || !category) {
      console.error(`❌ Skipping product with missing name or category:`, productData);
      continue;
    }

    const categoryId = categoryMap.get(category);
    if (!categoryId) {
      console.error(`❌ Category not found for product: ${productName} (Category: ${category})`);
      continue;
    }

    // Convert HSN CODE to string
    const hsnCode = String(productData["HSN CODE"] || "");
    const image = productData.Image || "";
    const description = productData.Description || "";
    const featured = productData.Featured || false;
    const bestSeller = productData["Best Seller"] || false;

    try {
      const product = await prisma.product.upsert({
        where: { itemCode: productData["ITEM CODE"] },
        update: {
          name: productName,
          categoryId,
          weight: productData.Weight || "",
          mrp: productData.MRP || 0,
          salePrice: productData["SALE PRICE"] || 0,
          gst: productData.GST || 0.05,
          hsnCode,
          image,
          description,
          featured,
          bestSeller,
        },
        create: {
          name: productName,
          categoryId,
          itemCode: productData["ITEM CODE"] || "",
          weight: productData.Weight || "",
          mrp: productData.MRP || 0,
          salePrice: productData["SALE PRICE"] || 0,
          gst: productData.GST || 0.05,
          hsnCode,
          image,
          description,
          featured,
          bestSeller,
          inStock: true,
        },
      });
      
      if (product.createdAt.getTime() === product.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
    } catch (error: any) {
      console.error(`❌ Error creating product ${productName} (${productData["ITEM CODE"]}):`, error.message);
    }
  }

  console.log(`\n✨ Seed completed!`);
  console.log(`   Created: ${created} products`);
  console.log(`   Updated: ${updated} products`);
  console.log(`   Categories: ${uniqueCategories.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
