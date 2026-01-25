// Ürün Kategorileri
export type ProductCategory =
  | "findik"
  | "fistik"
  | "antep-fistigi"
  | "badem"
  | "ceviz"
  | "kaju"
  | "paketler";

// Ürün Alt Kategorileri
export type ProductSubcategory =
  | "sekersiz"
  | "balli"
  | "hurmali"
  | "kakaolu"
  | "sutlu-findik-kremasi"
  | "klasik";

// Besin Değerleri
export interface NutritionalInfo {
  calories: number; // per 100g
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  sugar?: number; // g
}

// Ürün Varyasyonu
export interface ProductVariant {
  id: string;
  name: string; // "250g", "450g", "850g"
  weight: number; // gram
  price: number; // TL
  originalPrice?: number; // İndirimli fiyat için
  stock: number;
  sku: string;
}

// Ürün
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  variants: ProductVariant[];
  images: string[];
  tags: string[];
  nutritionalInfo?: NutritionalInfo;
  vegan: boolean;
  glutenFree: boolean;
  sugarFree: boolean;
  highProtein: boolean;
  rating: number; // 0-5
  reviewCount: number;
  featured: boolean;
  new: boolean;
  discount?: number; // yüzde olarak, örn: 15
}

// Kategori Bilgisi
export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  productCount: number;
}

// Ürün Filtreleri
export interface ProductFilters {
  category?: ProductCategory;
  subcategory?: ProductSubcategory;
  priceRange?: [number, number];
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
  highProtein?: boolean;
  search?: string;
}

// Ürün Sıralama
export type ProductSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "popular";
