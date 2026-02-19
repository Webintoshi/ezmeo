# 🚀 FEATURED PRODUCTS SECTION - ULTRA DETAYLI IMPLEMENTASYON PLANI

## 📌 TABLE OF CONTENTS

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Tasarım Sistem Analizi](#tasarım-sistem-analizi)
3. [Component Mimarisi](#component-mimarisi)
4. [TypeScript Definitions](#typescript-definitions)
5. [State Management](#state-management)
6. [Data Fetching Strategy](#data-fetching-strategy)
7. [Complete Implementation](#complete-implementation)
8. [Accessibility](#accessibility)
9. [Performance Optimization](#performance-optimization)
10. [Testing Strategy](#testing-strategy)
11. [Analytics & Monitoring](#analytics--monitoring)
12. [Deployment Plan](#deployment-plan)

---

## 1. PROJE GENEL BAKIŞ

### 1.1 Amaç ve Hedef

**Temel Amaç**: Ana sayfada, Marquee section'ının hemen altına, yüksek dönüşüm odaklı bir ürün vitrini section'ı eklemek.

**İş Hedefleri**:
- 🎯 Ürünlere tıklama oranını (CTR) %20 artırmak
- 💰 Sepete ekleme oranını %15 artırmak
- 📈 Sayfa kalma süresini 30 saniye artırmak
- 🔄 Tekrarlayan ziyaret oranını %10 artırmak

**Kullanıcı Deneyimi Hedefleri**:
- ⚡ İlk yükleme süresi < 1.5 saniye (4G)
- 👆 İlk etkileşim süresi < 2 saniye
- 🎨 Görsel hiyerarşi net ve anlaşılır
- 📱 Mobil deneyim sorunsuz
- ♿ Erişilebilirlik standartlarına uygun (WCAG 2.1 AA)

### 1.2 Konum ve Entegrasyon

**Sayfa**: Ana sayfa (`app/page.tsx`)

**Sıra**:
```
┌─────────────────────────────────────┐
│ 1. AnnouncementBar                 │
│ 2. Hero (Slider)                    │
│ 3. Marquee (Brands)                 │
│ 4. FeaturedProducts ⭐ YENI         │
│ 5. CategoryShowcase                 │
│ 6. HeroProducts                     │
│ 7. ProductShowcase                  │
│ 8. WhyChooseUs                      │
│ 9. SpecialOffer                     │
│ 10. Testimonials                    │
└─────────────────────────────────────┘
```

**Görsel Hiyerarşi**:
1. Hero (Slider) - Ana mesaj
2. Marquee - Social proof
3. **FeaturedProducts** - Ürün spotlight ⭐
4. CategoryShowcase - Kategoriler
5. Diğer section'lar

### 1.3 Referans Tasarım Analizi

**Görsel Elementler**:
- 📐 Layout: Asimetrik grid (hero + mini cards)
- 🎨 Renkler: Gradient background (blue-50 → secondary/30)
- 🖼️ Görseller: Product images, white cards, shadow effects
- ✨ Animasyonlar: Hover, scroll, fade-in
- 📝 Typography: Bold başlıklar, clear hierarchy

**Layout Detayları**:
```
Desktop (> 1024px):
┌────────────────────────────────────────────────────┐
│            "ÇITIR LEZZETLER"                        │
│            [YENİ GELENLER]                          │
├──────────────────────────────┬─────────────────────┤
│                              │ ┌─────────────────┐ │
│                              │ │ Ürün 1           │ │
│      HERO ÜRÜN               │ │ [Görsel]         │ │
│    (Büyük Görsel)            │ │ Adı + Fiyat      │ │
│    (Adı + Fiyat)             │ │ [Sepete Ekle]    │ │
│    [Sepete Ekle - Geniş]     │ └─────────────────┘ │
│                              │ ┌─────────────────┐ │
│                              │ │ Ürün 2           │ │
│                              │ │ [Görsel]         │ │
│                              │ │ Adı + Fiyat      │ │
│                              │ │ [Sepete Ekle]    │ │
│                              │ └─────────────────┘ │
│                              │ ┌─────────────────┐ │
│                              │ │ Ürün 3           │ │
│                              │ │ [Görsel]         │ │
│                              │ │ Adı + Fiyat      │ │
│                              │ │ [Sepete Ekle]    │ │
│                              │ └─────────────────┘ │
└──────────────────────────────┴─────────────────────┘
      55% (7 cols)                    45% (5 cols)
```

---

## 2. TASARIM SİSTEM ANALİZİ

### 2.1 Renk Paleti (Mevcut Site ile Uyumlu)

#### Primary Colors
```css
/* Blue - Ana renk */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* Ana blue */
--color-primary-600: #2563eb;  /* Button background */
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

#### Secondary Colors (Amber/Orange)
```css
/* Amber - Accent renk */
--color-secondary-50: #fffbeb;
--color-secondary-100: #fef3c7;
--color-secondary-200: #fde68a;
--color-secondary-300: #fcd34d;
--color-secondary-400: #fbbf24;
--color-secondary-500: #f59e0b;
--color-secondary-600: #d97706;
--color-secondary-700: #b45309;
```

#### Neutral Colors
```css
/* Gray - Text ve borders */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

#### Semantic Colors
```css
/* Success - Emerald */
--color-success-500: #10b981;
--color-success-600: #059669;

/* Warning - Amber */
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Error - Rose */
--color-error-500: #f43f5e;
--color-error-600: #e11d48;

/* Info - Blue */
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
```

### 2.2 Typography Scale

#### Font Sizes
```css
/* Hero Section Başlık */
--text-5xl: 3rem (48px)        /* line-height: 1.1 */
--text-4xl: 2.25rem (36px)     /* line-height: 1.2 */
--text-3xl: 1.875rem (30px)    /* line-height: 1.3 */
--text-2xl: 1.5rem (24px)      /* line-height: 1.4 */
--text-xl: 1.25rem (20px)      /* line-height: 1.5 */
--text-lg: 1.125rem (18px)     /* line-height: 1.6 */
--text-base: 1rem (16px)       /* line-height: 1.7 */
--text-sm: 0.875rem (14px)     /* line-height: 1.7 */
--text-xs: 0.75rem (12px)      /* line-height: 1.7 */
```

#### Font Weights
```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

#### Usage
```tsx
// Section Header
<h2 className="text-5xl md:text-6xl font-black text-gray-900">
  Çıtır Lezzetler
</h2>

// Badge Text
<span className="text-sm font-bold uppercase tracking-wider">
  YENİ GELENLER
</span>

// Product Name (Hero)
<h3 className="text-3xl font-bold">
  Çikolatalı Fıstık Ezmesi
</h3>

// Product Name (Mini)
<h4 className="text-base font-bold line-clamp-2">
  Sade Fıstık Ezmesi
</h4>

// Price
<span className="text-4xl font-black">
  ₺89.90
</span>
```

### 2.3 Spacing System

#### Base Unit: 4px (0.25rem)
```css
--spacing-0: 0;
--spacing-1: 0.25rem (4px);
--spacing-2: 0.5rem (8px);
--spacing-3: 0.75rem (12px);
--spacing-4: 1rem (16px);
--spacing-5: 1.25rem (20px);
--spacing-6: 1.5rem (24px);
--spacing-8: 2rem (32px);
--spacing-10: 2.5rem (40px);
--spacing-12: 3rem (48px);
--spacing-16: 4rem (64px);
--spacing-20: 5rem (80px);
--spacing-24: 6rem (96px);
```

#### Usage
```tsx
// Section padding
<section className="py-16 md:py-24">

// Container padding
<div className="px-4">

// Gap between cards
<div className="gap-6 md:gap-8">

// Card padding
<div className="p-6">

// Badge padding
<span className="px-4 py-2">

// Button padding
<button className="px-6 py-4">
```

### 2.4 Border Radius

```css
--radius-sm: 0.25rem (4px);
--radius-md: 0.375rem (6px);
--radius-lg: 0.5rem (8px);
--radius-xl: 0.75rem (12px);
--radius-2xl: 1rem (16px);
--radius-3xl: 1.5rem (24px);
--radius-full: 9999px;
```

#### Usage
```tsx
// Section badges
className="rounded-full"

// Product cards
className="rounded-3xl"     // Hero card
className="rounded-2xl"     // Mini cards
className="rounded-xl"      // Buttons

// Images
className="rounded-3xl"     // Product images
```

### 2.5 Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Colored shadows */
--shadow-primary-sm: 0 1px 2px 0 rgb(37 99 235 / 0.1);
--shadow-primary-lg: 0 10px 15px -3px rgb(37 99 235 / 0.1);
--shadow-primary-xl: 0 20px 25px -5px rgb(37 99 235 / 0.1);
```

#### Usage
```tsx
// Default state
className="shadow-lg"

// Hover state
className="hover:shadow-2xl"

// Focus state
className="focus:shadow-xl"

// Custom colored shadow
className="shadow-lg shadow-primary-600/20"
```

### 2.6 Breakpoints

```css
/* Mobile First Approach */
--screen-sm: 640px;    /* Small tablets */
--screen-md: 768px;    /* Tablets */
--screen-lg: 1024px;   /* Laptops */
--screen-xl: 1280px;   /* Desktops */
--screen-2xl: 1536px;  /* Large screens */
```

#### Usage
```tsx
// Responsive grid
className="grid grid-cols-1 md:grid-cols-12 gap-6"

// Responsive text
className="text-2xl md:text-3xl lg:text-4xl"

// Responsive spacing
className="p-4 md:p-6 lg:p-8"

// Responsive display
className="hidden md:block"

// Responsive layout
className="flex-col md:flex-row"
```

### 2.7 Transition Durations

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

#### Usage
```tsx
// Fast transitions (hover)
className="transition-all duration-200"

// Medium transitions (transform)
className="transition-all duration-300"

// Slow transitions (scroll animations)
className="transition-all duration-500"

// Image zoom
className="transition-transform duration-700"
```

### 2.8 Easing Functions

```css
--ease-linear: cubic-bezier(0, 0, 1, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

#### Usage
```tsx
// Smooth hover
className="ease-out"

// Natural movement
className="ease-in-out"

// Immediate feedback
className="ease-out"
```

---

## 3. COMPONENT MİMARİSİ

### 3.1 Component Hierarchy

```
FeaturedProducts (Container)
│
├── SectionHeader
│   ├── Badge (optional)
│   ├── Title
│   └── Subtitle (optional)
│
├── ProductsGrid
│   ├── HeroProductCard
│   │   ├── Badge (optional)
│   │   ├── ProductImage
│   │   ├── ProductInfo
│   │   │   ├── Name
│   │   │   ├── Price (with original price)
│   │   │   └── Discount Badge (optional)
│   │   └── AddToCartButton
│   │
│   └── MiniCardsContainer
│       ├── ProductMiniCard (1)
│       │   ├── Badge (optional)
│       │   ├── ProductImage
│       │   ├── ProductInfo
│       │   │   ├── Name
│       │   │   └── Price
│       │   └── AddToCartButton
│       ├── ProductMiniCard (2)
│       └── ProductMiniCard (3)
│
└── LoadingStates
    ├── HeroSkeleton
    └── MiniCardsSkeletons
```

### 3.2 Component Listesi

| Component | Dosya Yolu | Sorumluluk | Props | State |
|-----------|-----------|-----------|-------|-------|
| **FeaturedProducts** | `components/sections/FeaturedProducts.tsx` | Ana container, data fetching, error handling | `title?`, `subtitle?`, `badge?`, `dataSource?` | `heroProduct`, `products`, `loading`, `error`, `isVisible` |
| **SectionHeader** | `components/sections/featured/SectionHeader.tsx` | Section başlığı, badge, subtitle | `title`, `subtitle?`, `badge?`, `badgeColor?`, `isVisible` | - |
| **HeroProductCard** | `components/sections/featured/HeroProductCard.tsx` | Sol taraftaki büyük ürün kartı | `product`, `onAddToCart`, `index` | `isAdding`, `isHovered` |
| **ProductMiniCard** | `components/sections/featured/ProductMiniCard.tsx` | Sağ taraftaki küçük ürün kartları | `product`, `onAddToCart`, `index`, `isVisible` | `isAdding`, `isHovered` |
| **ProductBadge** | `components/sections/featured/ProductBadge.tsx` | Ürün badge'i (new/discount/bestseller) | `type`, `position?` | - |
| **AddToCartButton** | `components/sections/featured/AddToCartButton.tsx` | Sepete ekle butonu (shared) | `product`, `variant`, `disabled`, `loading`, `size`, `onClick` | `isAdding` |

### 3.3 Data Flow

```
Supabase / Settings / Static
        ↓
FeaturedProducts (fetch & transform)
        ↓
    State (heroProduct + products)
        ↓
    Props Down
        ↓
┌───────────────────────┐
│   HeroProductCard     │
│   ProductMiniCard 1   │
│   ProductMiniCard 2   │
│   ProductMiniCard 3   │
└───────────────────────┘
        ↓
   User Actions
        ↓
Events (onClick, onAddToCart)
        ↓
CartContext (useCart)
        ↓
   Update Cart
        ↓
   Show Toast
```

---

## 4. TYPESCRIPT DEFINITIONS

### 4.1 Product Types

```typescript
/**
 * Ürün varyantı
 * Her ürünün birden fazla varyantı olabilir (farklı gramaj, renk vb.)
 */
export interface ProductVariant {
  /** Varyant UUID */
  id: string;

  /** Varyant adı (örn: "450g", "850g") */
  name: string;

  /** Varyant fiyatı (TL) */
  price: number;

  /** Orijinal fiyat (indirim varsa) */
  originalPrice?: number;

  /** Stok miktarı */
  stock: number;

  /** Varyant ağırlığı (gram) */
  weight: number;

  /** Varyant barkodu */
  barcode?: string;

  /** Varyant SKU kodu */
  sku?: string;

  /** Varyant görseli (opsiyonel) */
  image?: string;
}

/**
 * Temel ürün bilgisi
 */
export interface Product {
  /** Ürün UUID */
  id: string;

  /** Ürün adı */
  name: string;

  /** SEO-friendly URL slug */
  slug: string;

  /** Kategori slug'ı */
  category: string;

  /** Ürün görselleri (URL array) */
  images: string[];

  /** Kısa açıklama */
  shortDescription?: string;

  /** Uzun açıklama */
  description?: string;

  /** Ürün rating'i (1-5) */
  rating: number;

  /** Değerlendirme sayısı */
  reviewCount: number;

  /** Ürün varyantları */
  variants: ProductVariant[];

  /** Ürün durumu */
  status: 'active' | 'draft' | 'archived';

  /** Ürün etiketleri */
  tags?: string[];

  /** SEO meta başlığı */
  metaTitle?: string;

  /** SEO meta açıklaması */
  metaDescription?: string;

  /** Oluşturulma tarihi */
  createdAt: string;

  /** Güncelleme tarihi */
  updatedAt: string;
}
```

### 4.2 Featured Products Types

```typescript
/**
 * Featured section için ürün tipi
 * Product tipinden türetilmiş, ek alanlar içerir
 */
export interface FeaturedProduct extends Omit<Product, 'variants'> {
  /** İlk varyant (varsayılan) */
  variant: ProductVariant;

  /** Ürün badge tipi */
  badge?: 'new' | 'discount' | 'bestseller';

  /** İndirim yüzdesi (otomatik hesaplanır) */
  discount?: number;

  /** Öne çıkma nedeni */
  featuredReason?: string;

  /** Gösterim sırası */
  displayOrder?: number;
}

/**
 * Featured products ayarları
 * Settings tablosundan gelecek veri yapısı
 */
export interface FeaturedProductsSettings {
  /** Section başlığı */
  title: string;

  /** Section alt başlığı (opsiyonel) */
  subtitle?: string;

  /** Section badge text'i (opsiyonel) */
  badge?: string;

  /** Badge rengi */
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning';

  /** Ana (hero) ürün ID'si */
  heroProductId: string;

  /** Mini kart ürün ID'leri (max 3) */
  productIds: string[];

  /** Otomatik bestseller kullanılsın mı? */
  useAutoBestsellers?: boolean;

  /** Bestseller kaç ürün? (auto bestseller açıksa) */
  bestsellerCount?: number;
}

/**
 * Data source tipi
 */
export type DataSourceType =
  | 'settings'      // Settings tablosundan
  | 'supabase'      // Doğrudan Supabase query
  | 'static';       // Static hard-coded data
```

### 4.3 Component Props Types

```typescript
/**
 * FeaturedProducts ana component props
 */
export interface FeaturedProductsProps {
  /** Section başlığı (varsayılan: "Çıtır Lezzetler") */
  title?: string;

  /** Section alt başlığı (opsiyonel) */
  subtitle?: string;

  /** Section badge text'i (opsiyonel) */
  badge?: string;

  /** Badge rengi (varsayılan: "primary") */
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning';

  /** Data source tipi (varsayılan: "settings") */
  dataSource?: DataSourceType;

  /** Manual product list (sadece static mode için) */
  staticProducts?: {
    heroProduct: FeaturedProduct;
    products: FeaturedProduct[];
  };

  /** CSS class name (override için) */
  className?: string;

  /** Container max-width override */
  containerClassName?: string;

  /** Test ID (testing için) */
  testId?: string;
}

/**
 * SectionHeader component props
 */
export interface SectionHeaderProps {
  /** Ana başlık */
  title: string;

  /** Alt başlık (opsiyonel) */
  subtitle?: string;

  /** Badge text (opsiyonel) */
  badge?: string;

  /** Badge rengi */
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning';

  /** Scroll animation için visible flag */
  isVisible: boolean;

  /** Animation delay (ms) */
  delay?: number;

  /** CSS class name (override) */
  className?: string;
}

/**
 * HeroProductCard component props
 */
export interface HeroProductCardProps {
  /** Ürün verisi */
  product: FeaturedProduct;

  /** Sepete ekle callback */
  onAddToCart: (product: FeaturedProduct) => Promise<void>;

  /** Animation index (stagger için) */
  index?: number;

  /** Scroll animation için visible flag */
  isVisible?: boolean;

  /** CSS class name (override) */
  className?: string;
}

/**
 * ProductMiniCard component props
 */
export interface ProductMiniCardProps {
  /** Ürün verisi */
  product: FeaturedProduct;

  /** Sepete ekle callback */
  onAddToCart: (product: FeaturedProduct) => Promise<void>;

  /** Card index (stagger animation için) */
  index: number;

  /** Scroll animation için visible flag */
  isVisible: boolean;

  /** CSS class name (override) */
  className?: string;
}

/**
 * ProductBadge component props
 */
export interface ProductBadgeProps {
  /** Badge tipi */
  type: 'new' | 'discount' | 'bestseller';

  /** İndirim yüzdesi (sadece discount tipi için) */
  discount?: number;

  /** Pozisyon (hero veya mini card) */
  position?: 'hero' | 'mini';

  /** CSS class name (override) */
  className?: string;
}

/**
 * AddToCartButton component props
 */
export interface AddToCartButtonProps {
  /** Yükleniyor mu? */
  loading?: boolean;

  /** Disabled mi? */
  disabled?: boolean;

  /** Buton boyutu */
  size?: 'sm' | 'md' | 'lg';

  /** Buton variant'i */
  variant?: 'primary' | 'secondary' | 'outline';

  /** Full width mi? */
  fullWidth?: boolean;

  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;

  /** CSS class name (override) */
  className?: string;

  /** Children (button text/content) */
  children: React.ReactNode;
}
```

### 4.4 State Types

```typescript
/**
 * FeaturedProducts component internal state
 */
export interface FeaturedProductsState {
  /** Ana (hero) ürün */
  heroProduct: FeaturedProduct | null;

  /** Mini kart ürünleri */
  products: FeaturedProduct[];

  /** Yükleniyor mu? */
  loading: boolean;

  /** Hata mesajı */
  error: string | null;

  /** Section görünür mü? (scroll animation) */
  isVisible: boolean;

  /** Yeniden deneme sayacı */
  retryCount: number;
}

/**
 * Add to cart button state
 */
export interface AddToCartButtonState {
  /** Ekleniyor mu? */
  isAdding: boolean;

  /** Başarılı mı oldu? */
  isSuccess: boolean;

  /** Hata mı oldu? */
  isError: boolean;
}
```

### 4.5 Utility Types

```typescript
/**
 * Nullable field
 */
export type Nullable<T> = T | null;

/**
 * Optional field
 */
export type Optional<T> = T | undefined;

/**
 * Async function return type
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * Props with forward ref
 */
export type PropsWithRef<P, E extends HTMLElement = HTMLElement> = P & {
  ref?: React.Ref<E>;
};
```

---

## 5. STATE MANAGEMENT

### 5.1 Component State

```typescript
export function FeaturedProducts({ ... }: FeaturedProductsProps) {
  // ========== DATA STATE ==========
  /**
   * Ana (hero) ürün
   * Sol tarafta gösterilen büyük ürün kartı
   */
  const [heroProduct, setHeroProduct] = useState<FeaturedProduct | null>(null);

  /**
   * Mini kart ürünleri
   * Sağ tarafta gösterilen 3 küçük ürün kartı
   * Array sırası important: [0] -> top, [1] -> middle, [2] -> bottom
   */
  const [products, setProducts] = useState<FeaturedProduct[]>([]);

  // ========== UI STATE ==========
  /**
   * Yükleme durumu
   * true: Skeleton göster
   * false: Gerçek content göster
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Hata durumu
   * null: Hata yok
   * string: Hata mesajı (toast ile gösterilebilir)
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Scroll animation visible flag
   * true: Animasyonları başlat
   * false: Animasyonları bekle
   */
  const [isVisible, setIsVisible] = useState<boolean>(false);

  /**
   * Retry sayacı
   * Data fetch başarısız olduğunda artar
   * Max 3 retry denenecek
   */
  const [retryCount, setRetryCount] = useState<number>(0);

  // ========== REFS ==========
  /**
   * Section element ref
   * IntersectionObserver için kullanılır
   */
  const sectionRef = useRef<HTMLElement>(null);

  /**
   * AbortController ref
   * Async request'leri cancel etmek için
   */
  const abortControllerRef = useRef<AbortController | null>(null);
}
```

### 5.2 State Transition Diagram

```
                    ┌─────────────────┐
                    │    INITIALIZING  │
                    │   (loading=true) │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │    FETCHING      │◄────────┐
                    │   (loading=true) │         │
                    └────────┬─────────┘         │
                             │                   │
                    ┌────────▼─────────┐         │
                    │    SUCCESS       │         │
                    │  (loading=false, │         │
                    │   error=null)    │         │
                    └──────────────────┘         │
                             │                   │
                             ▼                   │
                    ┌─────────────────┐         │
                    │    RENDERED      │         │
                    │  (isVisible=true)│         │
                    └──────────────────┘         │
                                               │
              ┌────────────────────────────────┘
              │
              │ Retry?
              ▼
    ┌─────────────────┐
    │     ERROR       │
    │ (loading=false, │
    │  error=string)  │
    └─────────────────┘
```

### 5.3 Derived State

```typescript
/**
 * Derived state examples
 * Use useMemo to avoid unnecessary recalculations
 */

// Example 1: Hero product has discount?
const heroHasDiscount = useMemo(() => {
  return heroProduct?.variant.originalPrice &&
    heroProduct.variant.originalPrice > heroProduct.variant.price;
}, [heroProduct]);

// Example 2: Total products count
const totalProductsCount = useMemo(() => {
  return products.length + (heroProduct ? 1 : 0);
}, [products, heroProduct]);

// Example 3: All products in stock?
const allInStock = useMemo(() => {
  if (!heroProduct) return false;
  return heroProduct.variant.stock > 0 &&
    products.every(p => p.variant.stock > 0);
}, [heroProduct, products]);

// Example 4: Average rating
const averageRating = useMemo(() => {
  const allProducts = [heroProduct, ...products].filter(Boolean);
  if (allProducts.length === 0) return 0;

  const total = allProducts.reduce((sum, p) => sum + (p?.rating || 0), 0);
  return total / allProducts.length;
}, [heroProduct, products]);
```

### 5.4 State Update Patterns

```typescript
// ========== CORRECT PATTERNS ==========

// Pattern 1: Functional updates (when new state depends on old state)
setProducts(prev => [...prev, newProduct]);

// Pattern 2: Batch updates (multiple state updates together)
const handleDataFetch = async () => {
  setLoading(true);
  setError(null);

  try {
    const data = await fetchData();
    setHeroProduct(data.hero);
    setProducts(data.mini);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// Pattern 3: Immutable updates (arrays/objects)
setProducts(prev => prev.map(p =>
  p.id === productId ? { ...p, name: newName } : p
));

// ========== INCORRECT PATTERNS ==========

// ❌ Don't do this (direct mutation)
products.push(newProduct);
setProducts(products);

// ❌ Don't do this (stale closure)
setProducts([...products, newProduct]);

// ❌ Don't do this (race condition)
setLoading(false); // Outside try-catch
```

---

## 6. DATA FETCHING STRATEGY

### 6.1 Data Source Options

#### Option 1: Settings Table (RECOMMENDED)

**Avantajları**:
- ✅ Admin panel'den yönetilebilir
- ✅ Esnek yapı
- ✅ Cache'lenebilir
- ✅ A/B test friendly

**Dezavantajları**:
- ❌ Manual selection required
- ❌ Auto-update yok

**Implementation**:
```typescript
async function fetchFromSettings(): Promise<{
  heroProduct: FeaturedProduct | null;
  products: FeaturedProduct[];
}> {
  // Step 1: Fetch settings
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'featured_products')
    .single();

  if (settingsError || !settings) {
    throw new Error('Failed to fetch featured products settings');
  }

  const config = settings.value as FeaturedProductsSettings;

  // Step 2: Fetch hero product
  const { data: hero, error: heroError } = await supabase
    .from('products')
    .select(`
      *,
      variants(*)
    `)
    .eq('id', config.heroProductId)
    .eq('status', 'active')
    .single();

  if (heroError || !hero) {
    throw new Error('Failed to fetch hero product');
  }

  // Step 3: Fetch mini products
  const { data: mini, error: miniError } = await supabase
    .from('products')
    .select(`
      *,
      variants(*)
    `)
    .in('id', config.productIds)
    .eq('status', 'active');

  if (miniError || !mini) {
    throw new Error('Failed to fetch mini products');
  }

  // Step 4: Transform to FeaturedProduct type
  const heroFeatured = transformToFeaturedProduct(hero, config);
  const miniFeatured = mini.map(p => transformToFeaturedProduct(p, config));

  // Step 5: Sort by display order
  miniFeatured.sort((a, b) =>
    (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  return {
    heroProduct: heroFeatured,
    products: miniFeatured.slice(0, 3) // Max 3 products
  };
}
```

#### Option 2: Supabase Query (Auto Bestsellers)

**Avantajları**:
- ✅ Automatic update
- ✅ Bestseller detection
- ✅ Manual intervention yok

**Dezavantajları**:
- ❌ Less control
- ❌ Performance overhead
- ❌ Cacheleme zor

**Implementation**:
```typescript
async function fetchBestsellers(): Promise<{
  heroProduct: FeaturedProduct | null;
  products: FeaturedProduct[];
}> {
  // Step 1: Fetch top 4 products by sales count
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants(*),
      order_items(count)
    `)
    .eq('status', 'active')
    .order('order_items(count)', { ascending: false })
    .limit(4);

  if (error || !data || data.length === 0) {
    throw new Error('No products found');
  }

  // Step 2: First product = hero
  const hero = transformToFeaturedProduct(data[0]);
  const mini = data.slice(1).map(p => transformToFeaturedProduct(p));

  return {
    heroProduct: hero,
    products: mini
  };
}
```

#### Option 3: Static Data (Fallback)

**Avantajları**:
- ✅ Fast
- ✅ No API call
- ✅ Reliable

**Dezavantajları**:
- ❌ Manual update required
- ❌ Code deployment needed

**Implementation**:
```typescript
const STATIC_FEATURED_PRODUCTS: {
  heroProduct: FeaturedProduct;
  products: FeaturedProduct[];
} = {
  heroProduct: {
    id: 'static-hero-1',
    name: 'Çikolatalı Fıstık Ezmesi',
    slug: 'cikolatali-fistik-ezmesi',
    category: 'fistik-ezmesi',
    images: ['https://...'],
    rating: 4.8,
    reviewCount: 124,
    variant: {
      id: 'variant-1',
      name: '450g',
      price: 89.90,
      originalPrice: 109.90,
      stock: 50,
      weight: 450
    },
    badge: 'discount',
    discount: 18,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  products: [
    // ... 3 more products
  ]
};
```

### 6.2 Data Transformation

```typescript
/**
 * Raw Product → FeaturedProduct transform
 */
function transformToFeaturedProduct(
  product: Product,
  settings?: FeaturedProductsSettings
): FeaturedProduct {
  // Get first variant (default)
  const variant = product.variants[0];

  if (!variant) {
    throw new Error(`Product ${product.id} has no variants`);
  }

  // Calculate discount
  let discount: number | undefined;
  if (variant.originalPrice && variant.originalPrice > variant.price) {
    discount = Math.round(
      ((variant.originalPrice - variant.price) / variant.originalPrice) * 100
    );
  }

  // Determine badge
  let badge: FeaturedProduct['badge'];
  if (settings?.badgeColor === 'success') {
    badge = 'new';
  } else if (discount && discount > 0) {
    badge = 'discount';
  }

  // Find display order
  const displayOrder = settings?.productIds.indexOf(product.id);

  return {
    ...product,
    variant,
    badge,
    discount,
    displayOrder: displayOrder ?? undefined
  };
}
```

### 6.3 Fetch Logic with Retry

```typescript
const MAX_RETRY = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchFeaturedProducts(
  dataSource: DataSourceType,
  signal?: AbortSignal
): Promise<{
  heroProduct: FeaturedProduct | null;
  products: FeaturedProduct[];
}> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    try {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      let data;

      switch (dataSource) {
        case 'settings':
          data = await fetchFromSettings();
          break;

        case 'supabase':
          data = await fetchBestsellers();
          break;

        case 'static':
          data = STATIC_FEATURED_PRODUCTS;
          break;

        default:
          throw new Error(`Invalid data source: ${dataSource}`);
      }

      // Success!
      return data;

    } catch (error) {
      lastError = error as Error;

      // Log error
      console.error(`Attempt ${attempt + 1} failed:`, error);

      // Don't retry on abort
      if (signal?.aborted) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt < MAX_RETRY - 1) {
        // Wait before retry
        await new Promise(resolve =>
          setTimeout(resolve, RETRY_DELAY * (attempt + 1))
        );
      }
    }
  }

  // All retries failed
  throw lastError;
}
```

### 6.4 Caching Strategy

```typescript
/**
 * Cache featured products data
 * TTL: 5 minutes
 */
const CACHE_KEY = 'featured_products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: {
    heroProduct: FeaturedProduct | null;
    products: FeaturedProduct[];
  };
  timestamp: number;
}

function getCachedData(): CachedData | null {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached) as CachedData;
    const now = Date.now();

    // Check if expired
    if (now - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function setCachedData(data: CachedData['data']): void {
  if (typeof window === 'undefined') return;

  const cached: CachedData = {
    data,
    timestamp: Date.now()
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
}
```

---

## 7. COMPLETE IMPLEMENTATION

Devam edecek... (Kod implementasyonları çok detaylı olacak)
