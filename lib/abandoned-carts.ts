import {
  AbandonedCart,
  AbandonedCartItem,
  AbandonedCartFilters,
  AbandonedCartSort,
} from "@/types/abandoned-cart";
import { getAllProducts } from "@/lib/products";

export type {
  AbandonedCart,
  AbandonedCartItem,
  AbandonedCartFilters,
  AbandonedCartSort,
} from "@/types/abandoned-cart";

let abandonedCarts: AbandonedCart[] = [];

export function initializeAbandonedCarts() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = localStorage.getItem("abandoned_carts");
    if (stored) {
      abandonedCarts = JSON.parse(stored);
    }
  } catch (error) {
    console.error("Abandoned carts initialization error:", error);
    abandonedCarts = [];
  }
}

function saveAbandonedCarts() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("abandoned_carts", JSON.stringify(abandonedCarts));
  } catch (error) {
    console.error("Abandoned carts save error:", error);
  }
}

// Get all abandoned carts
export function getAbandonedCarts(): AbandonedCart[] {
  return abandonedCarts;
}

// Get filtered and sorted abandoned carts
export function getFilteredAbandonedCarts(
  filters?: AbandonedCartFilters,
  sort?: AbandonedCartSort
): AbandonedCart[] {
  let carts = [...abandonedCarts];

  // Apply filters
  if (filters) {
    if (filters.isAnonymous !== undefined) {
      carts = carts.filter(c => c.isAnonymous === filters.isAnonymous);
    }
    if (filters.dateFrom) {
      carts = carts.filter(c => c.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      carts = carts.filter(c => c.createdAt <= filters.dateTo!);
    }
    if (filters.minTotal !== undefined) {
      carts = carts.filter(c => c.total >= filters.minTotal!);
    }
    if (filters.maxTotal !== undefined) {
      carts = carts.filter(c => c.total <= filters.maxTotal!);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      carts = carts.filter(c =>
        c.firstName?.toLowerCase().includes(search) ||
        c.lastName?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.includes(search) ||
        c.items.some(item => item.productName.toLowerCase().includes(search))
      );
    }
  }

  // Apply sort
  if (sort) {
    carts.sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "date-asc":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "total-desc":
          return b.total - a.total;
        case "total-asc":
          return a.total - b.total;
        default:
          return 0;
      }
    });
  }

  return carts;
}

// Get abandoned cart by ID
export function getAbandonedCartById(id: string): AbandonedCart | undefined {
  return abandonedCarts.find(c => c.id === id);
}

// Add abandoned cart (this would be called from the frontend)
export async function addAbandonedCart(data: {
  userId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  items: {
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string;
    variantId: string;
    variantName: string;
    price: number;
    originalPrice?: number;
    quantity: number;
  }[];
}): Promise<AbandonedCart> {
  const products = await getAllProducts();

  const cartItems: AbandonedCartItem[] = data.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    const variant = product?.variants.find(v => v.id === item.variantId);

    return {
      id: `ac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      variantId: item.variantId,
      variantName: item.variantName,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: item.quantity,
      stock: variant?.stock || 0,
    };
  });

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const newCart: AbandonedCart = {
    id: `ac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    email: data.email,
    phone: data.phone,
    firstName: data.firstName,
    lastName: data.lastName,
    isAnonymous: !data.userId && !data.email,
    items: cartItems,
    total,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: new Date(),
    updatedAt: new Date(),
    recovered: false,
  };

  abandonedCarts.push(newCart);
  saveAbandonedCarts();

  return newCart;
}

// Mark cart as recovered
export function markCartAsRecovered(id: string): void {
  const index = abandonedCarts.findIndex(c => c.id === id);
  if (index !== -1) {
    abandonedCarts[index].recovered = true;
    abandonedCarts[index].recoveredAt = new Date();
    saveAbandonedCarts();
  }
}

// Delete abandoned cart
export function deleteAbandonedCart(id: string): void {
  abandonedCarts = abandonedCarts.filter(c => c.id !== id);
  saveAbandonedCarts();
}

// Get abandoned cart stats
export function getAbandonedCartStats() {
  const total = abandonedCarts.length;
  const anonymous = abandonedCarts.filter(c => c.isAnonymous).length;
  const identified = abandonedCarts.filter(c => !c.isAnonymous).length;
  const recovered = abandonedCarts.filter(c => c.recovered).length;
  const totalValue = abandonedCarts.reduce((sum, c) => sum + c.total, 0);
  const avgValue = total > 0 ? totalValue / total : 0;

  return {
    total,
    anonymous,
    identified,
    recovered,
    recoveryRate: total > 0 ? (recovered / total) * 100 : 0,
    totalValue,
    avgValue,
  };
}

// Clear all abandoned carts (for demo purposes)
export function clearAbandonedCarts(): void {
  abandonedCarts = [];
  saveAbandonedCarts();
}

// Initialize on module load
initializeAbandonedCarts();
