# Performans Optimizasyonu Planı

## Mevcut Durum Analizi

### Tespit Edilen Sorunlar

| Sorun | Etki | Öncelik |
|-------|------|----------|
| RedesignHome "use client" | Büyük JS bundle, geç render | 🔴 Critical |
| Font (.otf) local yükleme | FOIT/FOUT, geç yükleme | 🔴 Critical |
| Provider'lar sıralaması | İlk HTML geç geliyor | 🟠 High |
| Görsel boyutları belirsiz | CLS (layout shift) | 🟠 High |
| Third-party scriptler | Blocking render | 🟠 High |

## Optimizasyon Stratejisi

### 1. Font Optimizasyonu (LCP)

**Sorun**: `next/font/local` ile .otf yükleniyor - bu fontun yüklenmesi için bekliyor

**Çözüm**:
```typescript
// Önceki
const quenda = localFont({
  src: "./Quenda-Medium.otf",
  variable: "--font-quenda",
  display: "swap",
});

// Sonraki - preload + font-display: optional
const quenda = localFont({
  src: [
    {
      path: "./Quenda-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-quenda",
  display: "optional", // Hızlı render için
  preload: true,
});
```

### 2. Critical CSS & JS (LCP)

**Sorun**: Tüm JS birden yükleniyor

**Çözüm**:
- `next/script` ile third-party scriptleri `lazyOnload` veya `afterInteractive`
- Dynamic import kullanımı
- Component lazy loading

### 3. Image LCP Optimizasyonu

**Sorun**: Hero görselleri geç yükleniyor

**Çözüm**:
```typescript
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority={true} // LCP için critical
  placeholder="blur"
  blurDataURL="..." // Base64
/>
```

### 4. CLS Önleme

**Sorun**: Görseller yüklenirken layout kayıyor

**Çözüm**:
- Tüm Image bileşenlerine width/height ekleme
- aspect-ratio CSS kullanımı
- Font display: optional ile fallback

### 5. Provider Optimizasyonu

**Sorun**: Çok fazla nested provider render blocking yapıyor

**Çözüm**:
- Statik içerik provider dışına çıkarma
- Suspense kullanımı

## Uygulama Adımları

### Adım 1: Font Display Optional
- `display: "swap"` → `display: "optional"`
- Fallback fontları tanımla

### Adım 2: Hero Görseller Priority
- LCP görsellerine `priority={true}` ekle
- Preload linkleri ekle

### Adım 3: Script Loading Strategy
- GTM `afterInteractive` → `lazyOnload`
- Diğer scriptleri defer et

### Adım 4: Dynamic Imports
- Heavy componentleri lazy load
- `next/dynamic` kullanımı

### Adım 5: Image Sizes
- Tüm Image bileşenlerine sizes prop ekleme
- Responsive breakpoint'ler tanımla

## Beklenen Sonuçlar

| Metric | Hedef | Önceki (Tahmin) |
|--------|-------|------------------|
| LCP | < 2.5s | ~4-5s |
| CLS | < 0.1 | ~0.2 |
| INP | < 200ms | ~300ms |
| Total Bundle | < 200KB | ~400KB+ |

## Notlar

- Next.js 16 kullanılıyor - en son optimizasyonlar mevcut
- R2 Cloudflare storage - CDNavantajı var
- Sharp ile görsel optimizasyonu zaten yapılıyor
