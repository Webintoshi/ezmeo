export type DiscountType = "fixed" | "percentage" | "shipping" | "bogo";

export type DiscountStatus = "active" | "scheduled" | "expired" | "draft";

export type DiscountScope = "all" | "products" | "collections" | "customers";

export type DiscountVisibility = "public" | "private" | "password";

export type DiscountLimitType = "once" | "once_per_customer" | "unlimited";

export interface DiscountProduct {
  productId: string;
  productName: string;
  discount: number;
}

export interface DiscountCustomer {
  customerId: string;
  customerName: string;
}

export interface DiscountRule {
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  minimumQuantity?: number;
  requireCoupon?: boolean;
  excludeSaleItems?: boolean;
}

export interface DiscountUsage {
  totalUsed: number;
  usedThisMonth: number;
  usedToday: number;
  lastUsedAt?: Date;
}

export interface Discount {
  id: string;
  name: string;
  description?: string;
  code: string;
  type: DiscountType;
  status: DiscountStatus;
  value: number;
  minValue?: number;
  maxValue?: number;
  currency?: string;
  scope: DiscountScope;
  visibility: DiscountVisibility;
  password?: string;
  startDate: Date;
  endDate: Date;
  products?: DiscountProduct[];
  collections?: string[];
  customers?: DiscountCustomer[];
  rules: DiscountRule;
  limitType: DiscountLimitType;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  tags?: string[];
  notes?: string;
}

export interface DiscountFormData {
  id?: string;
  name: string;
  description?: string;
  code: string;
  type: DiscountType;
  status: DiscountStatus;
  value: number;
  minValue?: number;
  maxValue?: number;
  currency?: string;
  scope: DiscountScope;
  visibility: DiscountVisibility;
  password?: string;
  startDate: Date;
  endDate: Date;
  products?: DiscountProduct[];
  collections?: string[];
  customers?: DiscountCustomer[];
  rules: DiscountRule;
  limitType: DiscountLimitType;
  usageLimit?: number;
  tags?: string[];
  notes?: string;
}

export const DISCOUNT_TYPES = [
  { value: "percentage", label: "Yüzde İndirim", description: "Siparişin yüzdesi kadar indirim" },
  { value: "fixed", label: "Sabit İndirim", description: "Sabit miktar indirim" },
  { value: "shipping", label: "Kargo Ücreti İndirimi", description: "Kargo ücretini kaldır" },
  { value: "bogo", label: "Biri Al Birini Bedava", description: "Belirli ürünlerde özel" },
] as const;

export const DISCOUNT_STATUSES = [
  { value: "active", label: "Aktif", color: "bg-green-100 text-green-700" },
  { value: "scheduled", label: "Planlandı", color: "bg-blue-100 text-blue-700" },
  { value: "expired", label: "Süresi Doldu", color: "bg-red-100 text-red-700" },
  { value: "draft", label: "Taslak", color: "bg-gray-100 text-gray-700" },
] as const;

export const DISCOUNT_SCOPES = [
  { value: "all", label: "Tüm Siparişler", description: "Tüm siparişlerde geçerli" },
  { value: "products", label: "Seçili Ürünler", description: "Belirli ürünlerde geçerli" },
  { value: "collections", label: "Koleksiyonlar", description: "Belirli kategorilerde geçerli" },
  { value: "customers", label: "Seçili Müşteriler", description: "Belirli müşterilere özel" },
] as const;

export const DISCOUNT_VISIBILITYS = [
  { value: "public", label: "Herkese Açık", description: "Herkes kullanabilir" },
  { value: "private", label: "Özel", description: "Sadece seçili müşteriler" },
  { value: "password", label: "Parola Korumalı", description: "Parola ile kullanılabilir" },
] as const;

export const DISCOUNT_LIMIT_TYPES = [
  { value: "once", label: "Tek Kullanım", description: "Sadece bir kez kullanılabilir" },
  { value: "once_per_customer", label: "Müşteri Başı Bir Kez", description: "Her müşteri bir kez" },
  { value: "unlimited", label: "Sınırsız", description: "Sınırsız kullanım" },
] as const;
