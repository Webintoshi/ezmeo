# 🎯 FEATURED PRODUCTS SECTION - TASARIM PLANI

## 📍 KONUM VE AMAC

**Konum**: Ana sayfada, Marquee section'ının hemen altında
**Sıra**: 3. section (AnnouncementBar → Hero → Marquee → **FeaturedProducts** → CategoryShowcase)

**Amaç**:
- 🎯 En çok satan/öne çıkan ürünleri sergileme
- 💰 İndirimli ürünleri öne çıkarma
- 🛒 Kullanıcıyı direkt satın almaya yönlendirme
- 📱 Mobile-first, yüksek dönüşüm odaklı tasarım

---

## 🎨 TASARIM ANALİZİ (Referans Görsel)

### Layout Yapısı
```
┌─────────────────────────────────────────────────────────────┐
│                    ÇITIR LEZZETLER                           │
│                   [Badge: YENI/INDIRIM]                      │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  ┌──────────────────────┐ │
│                                  │  │  Ürün 1              │ │
│                                  │  │  [Görsel]            │ │
│         HERO ÜRÜN                │  │  Ürün Adı            │ │
│      [Büyük Görsel]              │  │  ₺89.90 ₺69.90      │ │
│                                  │  │  [Sepete Ekle]       │ │
│                                  │  └──────────────────────┘ │
│                                  │  ┌──────────────────────┐ │
│                                  │  │  Ürün 2              │ │
│                                  │  │  [Görsel]            │ │
│                                  │  │  Ürün Adı            │ │
│                                  │  │  ₺XX.XX              │ │
│                                  │  │  [Sepete Ekle]       │ │
│                                  │  └──────────────────────┘ │
│                                  │  ┌──────────────────────┐ │
│                                  │  │  Ürün 3              │ │
│                                  │  │  [Görsel]            │ │
│                                  │  │  Ürün Adı            │ │
│                                  │  │  ₺XX.XX              │ │
│                                  │  │  [Sepete Ekle]       │ │
│                                  │  └──────────────────────┘ │
└──────────────────────────────────┴──────────────────────────┘
```

### Renk Paleti (Mevcut Site ile Uyumlu)
- **Primary**: Blue-600 (butonlar, linkler)
- **Secondary**: Amber/Orange gradients
- **Background**: Gradient (blue-50 to secondary/30)
- **Cards**: White with shadow
- **Text**: Gray-900 (başlıklar), Gray-600 (body)

---

## 🏗️ COMPONENT MİMARİSİ

### Ana Component: `FeaturedProducts.tsx`

**Konum**: `components/sections/FeaturedProducts.tsx`

```typescript
interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number; // İndirimli ürünler için
  discount?: number; // İndirim yüzdesi (otomatik hesaplanabilir)
  badge?: 'new' | 'discount' | 'bestseller'; // Ürün etiketi
  inStock: boolean;
}

interface FeaturedProductsProps {
  title?: string; // Varsayılan: "Öne Çıkan Ürünler"
  subtitle?: string; // Alt başlık
  badge?: string; // Section badge text
  heroProduct?: FeaturedProduct; // Sol taraftaki büyük ürün
  products?: FeaturedProduct[]; // Sağ taraftaki 3 ürün
}
```

### Alt Componentler

#### 1. `HeroProductCard.tsx` - Sol taraftaki büyük ürün
```typescript
interface HeroProductCardProps {
  product: FeaturedProduct;
  onAddToCart: (productId: string) => void;
}
```

**Özellikler**:
- Büyük görsel (aspect ratio: 3/4)
- Ürün adı büyük font
- Fiyat gösterimi (original price varsa üzeri çizgili)
- "Sepete Ekle" butonu (tam genişlik)
- Hover efektleri (zoom, shadow)
- Badge (new/discount/bestseller)

#### 2. `ProductMiniCard.tsx` - Sağ taraftaki küçük ürün kartları
```typescript
interface ProductMiniCardProps {
  product: FeaturedProduct;
  onAddToCart: (productId: string) => void;
}
```

**Özellikler**:
- Küçük görsel (aspect ratio: 1/1)
- Ürün adı (2 satır limit)
- Fiyat gösterimi
- "Sepete Ekle" butonu (compact)
- Hover efekti (lift up)

#### 3. `SectionHeader.tsx` - Section başlığı
```typescript
interface SectionHeaderProps {
  title: string;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success';
}
```

---

## 📊 DATA YAPISI

### Static Data (Props ile)
```typescript
const defaultFeaturedProducts = {
  title: "Çıtır Lezzetler",
  badge: "YENİ GELENLER",
  heroProduct: {
    id: "prod-1",
    name: "Çikolatalı Fıstık Ezmesi",
    slug: "cikolatali-fistik-ezmesi",
    image: "/images/products/hero-1.jpg",
    price: 89.90,
    originalPrice: 109.90,
    discount: 18,
    badge: "discount",
    inStock: true
  },
  products: [
    {
      id: "prod-2",
      name: "Sade Fıstık Ezmesi",
      slug: "sade-fistik-ezmesi",
      image: "/images/products/mini-1.jpg",
      price: 79.90,
      inStock: true
    },
    {
      id: "prod-3",
      name: "Fındık Ezmesi",
      slug: "findik-ezmesi",
      image: "/images/products/mini-2.jpg",
      price: 69.90,
      inStock: true
    },
    {
      id: "prod-4",
      name: "Mix Kuruyemiş",
      slug: "mix-kuruyemis",
      image: "/images/products/mini-3.jpg",
      price: 149.90,
      originalPrice: 179.90,
      discount: 17,
      badge: "bestseller",
      inStock: true
    }
  ]
};
```

### Dynamic Data (Supabase)
```typescript
// Supabase'den çekme opsiyonu
const fetchFeaturedProducts = async () => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(4);

  return {
    heroProduct: data[0],
    products: data.slice(1, 4)
  };
};
```

### Settings-based (Admin Panel)
```typescript
// Settings tablosunda featured_products key
interface FeaturedProductsSettings {
  title: string;
  badge: string;
  heroProductId: string;
  productIds: string[];
}

// Supabase settings tablosundan
const { data } = await supabase
  .from('settings')
  .select('value')
  .eq('key', 'featured_products')
  .single();
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

#### Mobile (< 640px)
```
┌─────────────────┐
│  ÇITIR LEZZETLER│
├─────────────────┤
│  [HERO ÜRÜN]    │
│  [Büyük Görsel] │
│  Sepete Ekle    │
├─────────────────┤
│  [Ürün 1]       │
│  [Ürün 2]       │
│  [Ürün 3]       │
└─────────────────┘
```
- **Layout**: Stack (vertical)
- **Hero Product**: Full width
- **Mini Cards**: Vertical stack veya scrollable horizontal
- **Grid**: 1 column

#### Tablet (640px - 1024px)
```
┌─────────────────────────────────┐
│       ÇITIR LEZZETLER            │
├─────────────────┬───────────────┤
│                 │  [Ürün 1]     │
│   HERO ÜRÜN     │  [Ürün 2]     │
│                 │  [Ürün 3]     │
└─────────────────┴───────────────┘
```
- **Layout**: 2 column (60% - 40%)
- **Hero Product**: Left
- **Mini Cards**: Right (vertical stack)

#### Desktop (> 1024px)
```
┌─────────────────────────────────────────────────────────────┐
│                    ÇITIR LEZZETLER                           │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  ┌──────────────────────┐ │
│                                  │  │  Ürün 1              │ │
│         HERO ÜRÜN                │  └──────────────────────┘ │
│                                  │  ┌──────────────────────┐ │
│                                  │  │  Ürün 2              │ │
│                                  │  └──────────────────────┘ │
│                                  │  ┌──────────────────────┐ │
│                                  │  │  Ürün 3              │ │
│                                  │  └──────────────────────┘ │
└──────────────────────────────────┴──────────────────────────┘
```
- **Layout**: 2 column (55% - 45%)
- **Hero Product**: Left with more space
- **Mini Cards**: Right with equal height cards

### Tailwind Classes
```tsx
// Container
<div className="
  container
  mx-auto
  px-4
  py-16 md:py-24
  bg-gradient-to-br
  from-blue-50
  to-secondary/30
">

  {/* Grid System */}
  <div className="
    grid
    grid-cols-1
    md:grid-cols-12
    gap-6 md:gap-8
    items-start
  ">

    {/* Hero Product - Mobile: Full, Tablet+: 7 cols */}
    <div className="
      md:col-span-7
      lg:col-span-7
    ">
      <HeroProductCard product={heroProduct} />
    </div>

    {/* Mini Cards - Mobile: Full, Tablet+: 5 cols */}
    <div className="
      md:col-span-5
      lg:col-span-5
      flex
      flex-col
      gap-4
    ">
      {products.map(product => (
        <ProductMiniCard key={product.id} product={product} />
      ))}
    </div>

  </div>
</div>
```

---

## 🎬 ANİMASYONLAR

### Scroll Animasyonları
```tsx
// Mevcut scroll-slide class'ını kullanma
<div className="scroll-slide">
  {/* Content */}
</div>

// Component mount olduğunda
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    },
    { threshold: 0.1 }
  );

  if (sectionRef.current) {
    observer.observe(sectionRef.current);
  }

  return () => {
    if (sectionRef.current) {
      observer.unobserve(sectionRef.current);
    }
  };
}, []);
```

### Hover Animasyonları
```tsx
// Hero Product Card
className="
  group
  relative
  bg-white
  rounded-3xl
  overflow-hidden
  shadow-lg
  hover:shadow-2xl
  transition-all
  duration-500
  hover:-translate-y-2
"

// Image zoom
<Image
  className="
    object-cover
    group-hover:scale-110
    transition-transform
    duration-700
  "
/>

// Button
className="
  w-full
  px-6
  py-4
  bg-blue-600
  text-white
  rounded-xl
  font-semibold
  hover:bg-blue-700
  hover:shadow-lg
  transition-all
  duration-300
  active:scale-95
"
```

### Fade In Animation
```tsx
// Staggered children animation
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

<motion.div
  initial="hidden"
  animate={isVisible ? "visible" : "hidden"}
  variants={variants}
  custom={index}
>
  <ProductMiniCard product={product} />
</motion.div>
```

---

## 🛠️ IMPLEMENTASYON ADIMLARI

### Phase 1: Component Oluşturma (1-2 gün)

#### 1.1 Ana Component: `FeaturedProducts.tsx`
- [ ] Component yapısını oluştur
- [ ] Props tanımla
- [ ] State management (loading, error)
- [ ] Fetch logic (static/Supabase/settings)
- [ ] Loading states
- [ ] Error handling

**Dosya**: `components/sections/FeaturedProducts.tsx`

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { HeroProductCard } from "./featured/HeroProductCard";
import { ProductMiniCard } from "./featured/ProductMiniCard";
import { SectionHeader } from "./featured/SectionHeader";
import { cn } from "@/lib/utils";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  badge?: 'new' | 'discount' | 'bestseller';
  inStock: boolean;
}

interface FeaturedProductsProps {
  // Props for customization
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function FeaturedProducts({
  title = "Çıtır Lezzetler",
  subtitle,
  badge = "YENİ GELENLER"
}: FeaturedProductsProps) {
  const [heroProduct, setHeroProduct] = useState<FeaturedProduct | null>(null);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Fetch featured products
  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);

        // TODO: Implement actual fetch logic
        // Option 1: Static data
        // Option 2: Supabase query
        // Option 3: Settings table

        // Placeholder for now
        setHeroProduct(null);
        setProducts([]);

      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Ürünler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-7 aspect-[3/4] bg-gray-100 rounded-3xl animate-pulse" />
            <div className="md:col-span-5 flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-[4/1] bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return null; // Or show error message
  }

  // No products
  if (!heroProduct || products.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-secondary/30 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <SectionHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          isVisible={isVisible}
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Hero Product */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-7 lg:col-span-7"
          >
            <HeroProductCard product={heroProduct} />
          </motion.div>

          {/* Mini Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-5 lg:col-span-5 flex flex-col gap-4"
          >
            {products.map((product, index) => (
              <ProductMiniCard
                key={product.id}
                product={product}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

#### 1.2 Hero Product Card: `HeroProductCard.tsx`
- [ ] Product image container
- [ ] Badge component
- [ ] Price display (with original price)
- [ ] Add to cart button
- [ ] Hover effects
- [ ] Link to product page

**Dosya**: `components/sections/featured/HeroProductCard.tsx`

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/hooks/useCart"; // Assuming cart hook exists

interface HeroProductCardProps {
  product: FeaturedProduct;
}

export function HeroProductCard({ product }: HeroProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart(); // Assuming cart hook exists

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      href={ROUTES.product(product.slug)}
      className="group block relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      {/* Badge */}
      {product.badge && (
        <div className={cn(
          "absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
          product.badge === 'new' && "bg-emerald-500 text-white",
          product.badge === 'discount' && "bg-rose-500 text-white",
          product.badge === 'bestseller' && "bg-amber-500 text-white"
        )}>
          {product.badge === 'new' && 'Yeni'}
          {product.badge === 'discount' && `İndirim`}
          {product.badge === 'bestseller' && 'Çok Satan'}
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 55vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-lg">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl md:text-4xl font-black text-white">
            ₺{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xl text-white/70 line-through">
              ₺{product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.discount && (
            <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">
              %{product.discount}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !product.inStock}
          className={cn(
            "w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300",
            product.inStock
              ? "bg-white text-gray-900 hover:bg-blue-600 hover:text-white active:scale-95"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {isAdding ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Ekleniyor...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {product.inStock ? "Sepete Ekle" : "Stokta Yok"}
            </>
          )}
        </button>
      </div>

      {/* Rating (Optional) */}
      {product.rating && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-gray-900">{product.rating}</span>
        </div>
      )}
    </Link>
  );
}
```

#### 1.3 Product Mini Card: `ProductMiniCard.tsx`
- [ ] Compact layout
- [ ] Product image (square)
- [ ] Product name (truncate)
- [ ] Price display
- [ ] Add to cart button
- [ ] Hover effects

**Dosya**: `components/sections/featured/ProductMiniCard.tsx`

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";

interface ProductMiniCardProps {
  product: FeaturedProduct;
  index: number;
  isVisible: boolean;
}

export function ProductMiniCard({ product, index, isVisible }: ProductMiniCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Show error
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
    >
      <Link
        href={ROUTES.product(product.slug)}
        className="group flex bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* Product Image */}
        <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="128px"
          />

          {/* Badge */}
          {product.badge && (
            <div className={cn(
              "absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
              product.badge === 'new' && "bg-emerald-500 text-white",
              product.badge === 'discount' && "bg-rose-500 text-white",
              product.badge === 'bestseller' && "bg-amber-500 text-white"
            )}>
              {product.badge === 'new' && 'Yeni'}
              {product.badge === 'discount' && 'İndirim'}
              {product.badge === 'bestseller' && 'Popüler'}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h4>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-blue-600">
                ₺{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₺{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !product.inStock}
            className={cn(
              "self-start px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all duration-200",
              product.inStock
                ? "bg-gray-900 text-white hover:bg-blue-600 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Sepete Ekle
              </>
            )}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
```

#### 1.4 Section Header: `SectionHeader.tsx`
- [ ] Title display
- [ ] Badge component
- [ ] Subtitle (optional)
- [ ] Animation

**Dosya**: `components/sections/featured/SectionHeader.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning';
  isVisible: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  badgeColor = 'primary',
  isVisible
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      {/* Badge */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <div className={cn(
            "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider",
            badgeColor === 'primary' && "bg-blue-100 text-blue-700",
            badgeColor === 'secondary' && "bg-secondary/20 text-secondary",
            badgeColor === 'success' && "bg-emerald-100 text-emerald-700",
            badgeColor === 'warning' && "bg-amber-100 text-amber-700"
          )}>
            <Sparkles className="w-4 h-4" />
            {badge}
          </div>
        </motion.div>
      )}

      {/* Title */}
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-3">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
```

### Phase 2: Integration (1 gün)

#### 2.1 Ana Sayfaya Ekleme
- [ ] `app/page.tsx` dosyasını güncelle
- [ ] Import ekle
- [ ] Component'i Marquee'den sonra ekle
- [ ] Test et

**Değişiklik**: `app/page.tsx`

```tsx
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <Marquee />
      <FeaturedProducts /> {/* NEW */}
      <CategoryShowcase />
      <HeroProducts />
      {/* ... rest */}
    </>
  );
}
```

### Phase 3: Data Integration (1-2 gün)

#### 3.1 Supabase Integration (Opsiyon 1)
```typescript
// Featured products tablosu oluştur
CREATE TABLE featured_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  is_hero BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

// Query
const { data } = await supabase
  .from('featured_products')
  .select('*, products(*)')
  .order('display_order', { ascending: true });
```

#### 3.2 Settings Table (Opsiyon 2 - Önerilen)
```typescript
// Settings tablosuna ekle
{
  "key": "featured_products",
  "value": {
    "title": "Çıtır Lezzetler",
    "badge": "YENİ GELENLER",
    "heroProductId": "uuid-1",
    "productIds": ["uuid-2", "uuid-3", "uuid-4"]
  }
}

// Fetch
const { data } = await supabase
  .from('settings')
  .select('value')
  .eq('key', 'featured_products')
  .single();

const settings = data.value as FeaturedProductsSettings;

// Fetch products
const { data: heroProduct } = await supabase
  .from('products')
  .select('*')
  .eq('id', settings.heroProductId)
  .single();

const { data: products } = await supabase
  .from('products')
  .select('*')
  .in('id', settings.productIds);
```

#### 3.3 Admin Panel Integration
- [ ] Featured products settings page
- [ ] Product selector (hero + 3 ürün)
- [ ] Display order management
- [ ] Title/badge customization
- [ ] Live preview

**Dosya**: `app/admin/featured-products/page.tsx` (yeni)

### Phase 4: Cart Integration (0.5 gün)

#### 4.1 Cart Hook
```typescript
// hooks/useCart.ts (veya mevcut cart context)
export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = async (productId: string, quantity: number) => {
    // Implement cart logic
    // Show success/error toast
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity
  };
}
```

### Phase 5: Styling & Polish (1 gün)

#### 5.1 Color Scheme
- [ ] Mevcut site colors ile uyumluluğu test et
- [ ] Dark mode support (opsiyonel)
- [ ] Consistent spacing
- [ ] Border radius consistency

#### 5.2 Typography
- [ ] Font sizes responsive
- [ ] Font weights consistent
- [ ] Line heights appropriate
- [ ] Text truncation

#### 5.3 Shadows & Borders
- [ ] Shadow system consistency
- [ ] Border colors match design system
- [ ] Rounded corners consistent (rounded-xl, rounded-2xl, rounded-3xl)

### Phase 6: Testing (1 gün)

#### 6.1 Functionality Tests
- [ ] Add to cart works
- [ ] Product links work
- [ ] Loading states show correctly
- [ ] Error states handle gracefully
- [ ] Hover effects work on all devices

#### 6.2 Responsive Tests
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] XL screens (> 1280px)

#### 6.3 Performance Tests
- [ ] Lighthouse score
- [ ] Image optimization
- [ ] Bundle size impact
- [ ] Initial load time
- [ ] Interaction responsiveness

---

## 📋 FEATURE CHECKLIST

### ✅ Temel Özellikler
- [x] Section header (title + badge)
- [x] Hero product card (sol taraf)
- [x] 3 mini product cards (sağ taraf)
- [x] Responsive layout
- [x] Product images
- [x] Price display
- [x] Discount indicator
- [x] Product badges (new/discount/bestseller)
- [x] Add to cart buttons
- [x] Product page links

### 🎨 Design Features
- [x] Gradient background
- [x] Decorative elements
- [x] Hover animations
- [x] Scroll animations
- [x] Shadow system
- [x] Rounded corners
- [x] Color consistency
- [x] Typography hierarchy

### 💡 Advanced Features
- [ ] Dynamic data from Supabase
- [ ] Admin panel integration
- [ ] Cart integration
- [ ] Toast notifications
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Analytics tracking
- [ ] SEO optimization

---

## 🎯 SUCCESS CRITERIA

### Fonksiyonel Gereksinimler
- ✅ 4 ürün görüntülenebiliyor (1 hero + 3 mini)
- ✅ Ürün detay sayfasına link veriliyor
- ✅ Sepete ekle butonu çalışıyor
- ✅ Responsive tasarım (mobile/tablet/desktop)
- ✅ Loading state gösteriliyor
- ✅ Error handling yapılıyor

### UX Gereksinimler
- ✅ Hover efektleri akıcı
- ✅ Animasyonlar smooth
- ✅ Touch-friendly buttons
- ✅ Clear visual hierarchy
- ✅ Consistent with site design

### Performans Gereksinimler
- ✅ Lighthouse score > 90
- ✅ First paint < 1.5s
- ✅ Time to interactive < 3s
- ✅ Image optimization (Next.js Image)
- ✅ Bundle size impact < 50KB

---

## 📦 DOSYA YAPISI

```
components/
├── sections/
│   ├── FeaturedProducts.tsx (ANA COMPONENT)
│   └── featured/
│       ├── HeroProductCard.tsx
│       ├── ProductMiniCard.tsx
│       └── SectionHeader.tsx
```

---

## 🔗 DEPENDENCIES

### Mevcut (Kullanılacak)
```json
{
  "next": "latest",
  "react": "^18",
  "framer-motion": "^10",
  "lucide-react": "latest",
  "@supabase/supabase-js": "latest",
  "tailwindcss": "latest"
}
```

### Yeni Gerekli
- ❌ Yok (mevcut paketler yeterli)

### Opsiyonel
- `react-hot-toast` - Toast notifications
- `swr` or `react-query` - Data fetching (opsiyonel)

---

## 🎬 DEMO DATA

```typescript
const demoProducts = {
  heroProduct: {
    id: "1",
    name: "Çikolatalı Fıstık Ezmesi",
    slug: "cikolatali-fistik-ezmesi",
    image: "https://images.unsplash.com/photo-1575515960895-38a13e6a49e0?w=800",
    price: 89.90,
    originalPrice: 109.90,
    discount: 18,
    badge: "discount",
    inStock: true,
    rating: 4.8
  },
  products: [
    {
      id: "2",
      name: %100 Doğal Fıstık Ezmesi",
      slug: "sade-fistik-ezmesi",
      image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400",
      price: 79.90,
      inStock: true,
      badge: "new"
    },
    {
      id: "3",
      name: "Fındık Ezmesi",
      slug: "findik-ezmesi",
      image: "https://images.unsplash.com/photo-1563412885-139e4045ec52?w=400",
      price: 69.90,
      inStock: true
    },
    {
      id: "4",
      name: "Mix Kuruyemiş Paketi",
      slug: "mix-kuruyemis",
      image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
      price: 149.90,
      originalPrice: 179.90,
      discount: 17,
      inStock: true,
      badge: "bestseller"
    }
  ]
};
```

---

## 🚀 DEPLOYMENT PLANI

### Development
1. Component'leri local'de oluştur
2. Demo data ile test et
3. Responsive test et
4. Performans testi yap

### Staging
1. Supabase integration test et
2. Admin panel'den ürün seç
3. Live preview test et
4. Cross-browser test (Chrome, Firefox, Safari, Edge)

### Production
1. Mevcut HeroProducts section'ını koru veya değiştir
2. FeaturedProducts section'ını ekle
3. Analytics tracking ekle
4. Monitor et (Sentry, LogRocket)

---

## 📊 ANALYTICS & TRACKING

```typescript
// Track events
analytics.track('featured_products_viewed', {
  section_title: title,
  products_count: products.length + 1,
  hero_product_id: heroProduct.id
});

analytics.track('featured_product_clicked', {
  product_id: productId,
  product_name: productName,
  position: position // 'hero' or 1, 2, 3
});

analytics.track('featured_product_add_to_cart', {
  product_id: productId,
  product_name: productName,
  price: price,
  position: position
});
```

---

## 🔄 ALTERNATİF YAKLAŞIMLAR

### Option 1: Full Dynamic (Supabase)
- **Artı**: Admin panel'den yönetilebilir
- **Eksi**: API latency
- **Kullanım**: Ürünler sık değişiyorsa

### Option 2: Settings Table (Önerilen)
- **Artı**: Esnek, admin kontrolü, cache'lenebilir
- **Eksi**: Manual product selection
- **Kullanım**: Dengeli yaklaşım

### Option 3: Static Data
- **Artı**: Hızlı, basit
- **Eksi**: Code deployment gerekli
- **Kullanım**: Ürünler nadiren değişiyorsa

### Option 4: Hybrid (Bestseller + Manual)
```typescript
// Hero product = manual selection
// Mini cards = auto bestsellers
const heroProduct = await getManualHeroProduct();
const products = await getBestsellerProducts(3);
```

---

## 🎯 CONCLUSION

Bu plan, Ezmeo ana sayfasına **high-converting featured products section** eklemek için kapsamlı bir yol haritası sunmaktadır. Tüm implementasyon sonunda:

✅ **Modern tasarım** (mevcut site ile tutarlı)
✅ **Responsive** (mobile-first)
✅ **Performance optimized** (Next.js Image, lazy loading)
✅ **Admin manageable** (settings table)
✅ **Cart integrated** (seamless UX)
✅ **SEO friendly** (semantic HTML, alt tags)

**Estimate**: 4-6 gün (admin panel dahil değil)
**Estimate**: 6-8 gün (admin panel ile birlikte)
