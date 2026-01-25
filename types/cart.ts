import { Product, ProductVariant } from "./product";

// Sepet Öğesi
export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

// Sepet Durumu
export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

// Kupon
export interface Coupon {
  code: string;
  discount: number; // yüzde veya sabit tutar
  type: "percentage" | "fixed";
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt?: Date;
}

// Sepet Context Tipi
export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, variantId: string) => number;
  getTotalItems: () => number;
  subtotal: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Favori Listesi
export interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

// Kargo Bilgisi
export const SHIPPING_THRESHOLD = 350; // Ücretsiz kargo sınırı (TL)
export const SHIPPING_COST = 29.90; // Standart kargo ücreti (TL)
