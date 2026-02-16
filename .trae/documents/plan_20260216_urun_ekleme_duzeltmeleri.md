# Ürün Ekleme/Düzenleme Sistem Düzeltmeleri

## Problem Tanımı

Ürün ekleme ve düzenleme sisteminde iki ana sorun tespit edildi:

### Sorun 1: Varyant Zorunluluğu
- **Problem**: ProductWizard'da varyant eklemek zorunlu tutuluyordu
- **Etki**: Kullanıcılar varyant eklemek istemedikleri ürünlere bile varyant eklemek zorunda kalıyorlardı
- **Konum**: `components/admin/product-wizard/ProductWizard.tsx` - validateStep() fonksiyonu

### Sorun 2: Yayında Olan Ürünler Gösterilmiyor
- **Problem**: `getProductBySlug()` ve `getAllProducts()` sadece `is_active = true` kontrolü yapıyordu
- **Etki**: Database'de `status = 'published'` olan ürünler sitede gösterilmiyordu (is_active false olsa bile)
- **Konum**: `lib/products.ts` - getAllProducts(), getProductSlug(), getProductBySlug() fonksiyonları

### Sorun 3: Varyantsız Ürünler Kartlarda Gösterilmiyor
- **Problem**: ProductCard'da varyant yoksa null döndürülüyordu
- **Etki**: Varyantsız ürünler ürün listesinde hiç görünmüyordu
- **Konum**: `components/product/ProductCard.tsx`

## Çözümler

### 1. Varyant Zorunluluğu Kaldırıldı
**Dosya**: `components/admin/product-wizard/ProductWizard.tsx`

```typescript
// Önceki (zorunlu)
case 3:
  if (formData.variants.length === 0) {
    newErrors.variants = "En az bir varyant gerekli";
  }
  ...

// Sonraki (opsiyonel)
case 3:
  // Varyantlar artık opsiyonel - kontrolü kaldırıldı
  break;
```

### 2. Status Kontrolü Eklendi
**Dosya**: `lib/products.ts`

```typescript
// Önceki
.eq("is_active", true)

// Sonraki
.eq("is_active", true)
.eq("status", "published")
```

### 3. Varyantsız Ürünler İçin Kart Gösterimi
**Dosya**: `components/product/ProductCard.tsx`

- Varyant yoksa "Varyant seçenekleri için tıklayın" mesajıyla kart gösteriliyor
- Fiyat yerine "---" gösteriliyor

## Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `lib/products.ts` | status = 'published' kontrolü eklendi |
| `components/admin/product-wizard/ProductWizard.tsx` | varyant zorunluluğu kaldırıldı |
| `components/product/ProductCard.tsx` | varyantsız ürünler için kart gösterimi |

## Not

- Ürün detay sayfasında varyant yoksa "Ürün bilgisi yüklenemedi" hatası veriyor - bu da düzeltilmeli
- Database'de mevcut ürünlerin `is_active` ve `status` alanlarının doğru olduğundan emin olunmalı
