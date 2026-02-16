# Görsel Yükleme Optimizasyonu

## Problem

Mevcut görsel yükleme sistemi sadece WebP formatına dönüştürme yapıyordu. Daha iyi sıkıştırma ve performans için AVIF desteği eklenmeli.

## Çözüm

### Yapılan Değişiklikler

**Dosya**: `app/api/upload/route.ts`

#### 1. AVIF Desteği
- **AVIF**: WebP'den %20-50 daha iyi sıkıştırma sağlar
- **Otomatik seçim**: Tarayıcı destekliyorsa AVIF, yoksa WebP kullan
- **Format parametresi**: `?format=avif|webp|auto`

#### 2. Gelişmiş Sıkıştırma Ayarları
```typescript
// AVIF - quality 80, chromaSubsampling 4:4:4, effort 6
.avif({
    quality: 80,
    chromaSubsampling: '4:4:4',
    effort: 6
})

// WebP - quality 85, chromaSubsampling 4:4:4, effort 6
.webp({
    quality: 85,
    effort: 6,
    chromaSubsampling: '4:4:4'
})
```

#### 3. EXIF Temizleme
- Gereksiz meta verileri (Orientation, GPS, vs.) kaldırılıyor
- `.rotate()` ve `.withMetadata()` ile temizlenmiş metadata

#### 4. Thumbnail Oluşturma
- Otomatik thumbnail oluşturma (opsiyonel)
- Parametre: `?thumbnail=false` ile devre dışı bırakılabilir
- Boyutlar:
  - products: 400x400
  - categories: 300x300
  - banners: 640x360

#### 5. Yanıt İyileştirmeleri
```json
{
    "success": true,
    "url": "...",
    "key": "...",
    "format": "avif",
    "width": 2048,
    "height": 1536,
    "originalSize": 2500000,
    "processedSize": 180000,
    "savings": 72,
    "thumbnail": {
        "url": "...",
        "key": "..."
    }
}
```

## Kullanım

### Standart Yükleme (AVIF öncelikli)
```javascript
const formData = new FormData();
formData.append('file', dosya);
formData.append('folder', 'products');
// thumbnail varsayılan olarak true

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});
```

### Thumbnail Olmadan
```javascript
formData.append('thumbnail', 'false');
```

### Format Belirleme
```javascript
formData.append('format', 'webp'); // Sadece WebP
formData.append('format', 'avif'); // Sadece AVIF
formData.append('format', 'auto'); // Otomatik (varsayılan)
```

## Avantajlar

| Metric | WebP | AVIF | Kazanım |
|--------|------|------|---------|
| Kalite | 85% | 80% | Aynı algılanan kalite |
| Boyut | ~200KB | ~150KB | ~25% küçük |
| Tarayıcı Desteği | %97+ | %90+ | Artıyor |

## Notlar

- Sharp 0.33.5 AVIF'i destekliyor
- Chroma subsampling 4:4:4 en iyi görsel kalitesini sağlar
- Effort 6, sıkıştırma hızı/kalite dengesi için optimal
