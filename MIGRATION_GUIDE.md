# Migration Guide: Zustand + React Query

## Quick Start

### 1. Update Navbar (Optional - Use Optimized Version)
Replace `components/shared/navbar.tsx` with `components/shared/navbar-optimized.tsx` or update manually:

```typescript
// OLD: localStorage-based
const [cartItemCount, setCartItemCount] = useState(0);
useEffect(() => {
  const storedCart = localStorage.getItem("cart");
  // ... manual parsing
}, []);

// NEW: Zustand store
import { useCartStore } from "@/lib/stores/use-cart-store";
const { getItemCount } = useCartStore();
const cartItemCount = getItemCount();
```

### 2. Update Products Page
```typescript
// OLD: Manual fetch with useState
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch("/api/products").then(res => res.json()).then(data => {
    setProducts(data.products);
    setLoading(false);
  });
}, []);

// NEW: React Query hook
import { useProducts } from "@/lib/hooks/use-products";
import { ProductsGridSkeleton } from "@/components/shared/loading-skeleton";

const { data: products, isLoading } = useProducts({ inStock: true });
if (isLoading) return <ProductsGridSkeleton />;
```

### 3. Update Cart Operations
```typescript
// OLD: localStorage
const addToCart = (item) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
};

// NEW: Zustand store
import { useCartStore } from "@/lib/stores/use-cart-store";
const { addItem } = useCartStore();
addItem({ productId, productName, quantity: 1, price });
```

### 4. Prevent Double Clicks
```typescript
// OLD: Manual state management
const [isSubmitting, setIsSubmitting] = useState(false);
const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  // ... submit
  setIsSubmitting(false);
};

// NEW: useSafeAction hook
import { useSafeAction } from "@/lib/hooks/use-safe-action";
const { execute: handleSubmit, isLoading } = useSafeAction(
  async () => {
    // ... submit logic
  }
);
```

## Component Updates Checklist

- [ ] Update `components/shared/navbar.tsx` to use `useCartStore`
- [ ] Update `app/home/products/page.tsx` to use `useProducts()` hook
- [ ] Update `app/home/cart/page.tsx` to use `useCartStore`
- [ ] Update `app/home/checkout/page.tsx` to use `useCartStore`
- [ ] Add loading skeletons to slow-loading pages
- [ ] Replace manual fetch calls with React Query hooks
- [ ] Add `useSafeAction` to all form submissions
- [ ] Update admin dashboard to use React Query

## Benefits

✅ **Faster Load Times** - Cached data, no redundant requests
✅ **Better UX** - Loading states, no blank screens
✅ **No Double Clicks** - Automatic prevention
✅ **Centralized State** - Easy to manage and debug
✅ **Type Safety** - Full TypeScript support
