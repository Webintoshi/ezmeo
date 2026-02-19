# Performans Optimizasyon Planı

## Mevcut Durum Analizi

### Tespit Edilen Performans Sorunları

#### 1. Çok Fazla Client-Side Veri Çekme (Critical)
- **RedesignHome**: Hero banner'ları Supabase'den client-side çekiyor
- **BestSellers**: Tüm ürünleri Supabase'den çekiyor (BÜYÜK SORUN - tüm ürünler yükleniyor)
- **ShopByCategory**: Kategorileri Supabase'den çekiyor
- **PromotionalBanners**: Promo banner'ları Supabase'den çekiyor
- **Header**: Kategorileri + arama fonksiyonu için ayrı çağrılar yapıyor

**Etki**: Her bileşen yüklendiğinde ayrı API çağrısı yapılıyor = 5+ gereksiz network request

#### 2. Bundle Size Sorunları (High)
- **framer-motion**: Büyük animasyon kütüphanesi, sadece basit animasyonlar için kullanılıyor
- **recharts**: Analytics için kullanılıyor ama homepage'de yok
- Tüm bileşenler "use client" = tamamı client-side render ediliyor

#### 3. Image Optimizasyon Eksiklikleri (High)
- Bazı görsellerde `unoptimized` flag'i kullanılmış (Next.js optimizasyonunu devre dışı bırakıyor)
- LCP (Largest Contentful Paint) için hero görselleri priority olmalı
- Boyutlandırma (sizes prop) her yerde doğru kullanılmamış

#### 4. Server vs Client Component Dağılımı (High)
- Tüm bileşenler "use client" = React hydration gecikiyor
- FCP (First Contentful Paint) gecikiyor
- SEO için kötü

---

## Çözüm Öncelik Sırası

### 🔴 Phase 1: Hemen Yapılacak (Critical Impact)

#### 1.1 Server-Side Rendering Entegrasyonu
**Dosyalar:**
- `app/page.tsx` → Server Component olarak kalacak
- Bileşenleri Server Component olarak yeniden yapılandır

**Yapılacaklar:**
- Ana sayfa verilerini `page.tsx` içinde server-side çek
- static generation veya ISR kullan
- Client-side fetch'leri kaldır

#### 1.2 BestSellers Optimizasyonu
**Sorun**: Tüm ürünler çekiliyor ama sadece 8 gösteriliyor

**Çözüm**:
```typescript
// Sadece limitli ürün çek
.supabase
  .from('products')
  .select('*, variants:product_variants(*)')
  .eq('is_active', true)
  .eq('status', 'published')
  .limit(8) // Sadece ilk 8 ürün
```

#### 1.3 Görsel Optimizasyonu
- `unoptimized` flag'lerini kaldır
- Tüm Next/Image bileşenlerine `priority` ekle (LCP için)
- `sizes` prop'larını düzelt

---

### 🟠 Phase 2: Kısa Vadeli (High Impact)

#### 2.1 Framer Motion Kaldırma/Değiştirme
**Sorun**: ~40KB bundle size

**Alternatifler:**
1. CSS transitions kullan (önerilen)
2. `motion` package'ı yerine daha hafif bir şey kullan
3. Sadece gerekli bileşenlerde kullan

#### 2.2 Code Splitting
- `dynamic()` import kullan
- Aşağı kaydırıldığında yüklenecek bileşenleri lazy load et

#### 2.3 Tek API Endpoint
- Homepage verilerini tek bir endpoint'te birleştir
- Örnek: `/api/homepage-data`

---

### 🟡 Phase 3: Orta Vadeli (Medium Impact)

#### 3.1 Image CDN Entegrasyonu
- Cloudinary/Vercel Image Optimization
- WebP/AVIF formatları

#### 3.2 Caching Strategy
- ISR (Incremental Static Regeneration) kullan
- Revalidation sürelerini ayarla

#### 3.3 Third-Party Script Optimizasyonu
- GTM'i `strategy="lazyOnload"` yerine `strategy="afterInteractive"` dene

---

## Önerilen Yapı

### Yeni Mimari

```
app/
├── page.tsx (Server Component - veri çekme burada)
│   ├── await HeroSection({ slides }) // Server Component
│   ├── await ShopByCategory({ categories }) // Server Component  
│   ├── await BestSellers({ products }) // Server Component
│   └── await PromotionalBanners({ banners }) // Server Component
│
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx (server or client with fetch)
│   │   ├── BestSellers.tsx (artık sadece render)
│   │   └── ...
```

---

## Beklenen İyileştirmeler

| Metrik | Şu Anki | Hedef |
|--------|---------|-------|
| LCP | ~4s | < 2.5s |
| FCP | ~3s | < 1.8s |
| TTI | ~5s | < 3.5s |
| Bundle Size | ~500KB | < 250KB |
| Network Requests | 10+ | 3-4 |

---

## Uygulama Sırası

1. **Step 1**: BestSellers'daki gereksiz veri çekmeyi düzelt (sadece 8 ürün)
2. **Step 2**: page.tsx'i Server Component olarak yeniden yapılandır
3. **Step 3**: Görsel optimizasyonu (priority, unoptimized kaldır)
4. **Step 4**: Framer motion'ı CSS transitions ile değiştir
5. **Step 5**: Code splitting uygula

---

## Notlar

- Analytics için gerekli `recharts` admin sayfasında kalabilir
- `framer-motion` tamamen kaldırılabilir - yerine CSS animasyonları kullanılabilir
- Supabase query'leri mutlaka `.limit()` ile sınırlandırılmalı
