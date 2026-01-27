/**
 * Common TypeScript types and interfaces
 */

// Cloudinary types
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

// Product types
export interface ProductCreateData {
  name: string;
  categoryId: string;
  itemCode: string;
  weight: string;
  mrp: number;
  salePrice: number;
  gst?: number;
  hsnCode: string;
  image?: string;
  images?: string[];
  description?: string;
  featured?: boolean;
  bestSeller?: boolean;
  inStock?: boolean;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Prisma where clause type helper
export type PrismaWhere<T> = Partial<T> & {
  OR?: Array<Partial<T>>;
  AND?: Array<Partial<T>>;
};
