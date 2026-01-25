import { CartItem } from "./cart";
import { Address } from "./user";

// Sipariş Durumu
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

// Ödeme Yöntemi
export type PaymentMethod =
  | "credit-card"
  | "bank-transfer"
  | "cash-on-delivery";

// Ödeme Durumu
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

// Sipariş Öğesi
export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  price: number;
  total: number;
}

// Kargo Bilgisi
export interface ShippingInfo {
  method: "standard" | "express";
  company: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  cost: number;
}

// Sipariş
export interface Order {
  id: string;
  orderNumber: string; // "EZM-2024-000123"
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  shippingInfo: ShippingInfo;
  couponCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sipariş Oluşturma Formu
export interface CreateOrderData {
  items: CartItem[];
  shippingAddress: Address;
  shippingMethod: "standard" | "express";
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}
