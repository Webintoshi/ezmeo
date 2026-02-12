# Cloudflare R2 Custom Domain Kurulumu

## Mevcut Durum
- R2 Bucket: `ezmeo-assets`
- Custom Domain: `cdn.ezmeo.com`
- Mevcut R2_PUBLIC_URL: `https://pub-245578082b99402d9e1093b849089bb2.r2.dev` (R2 default)

## Yapılması Gerekenler

### 1. Cloudflare R2'da Custom Domain Ayarı

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 → Buckets
2. `ezmeo-assets` bucket'ı seçin
3. **Settings** sekmesine gidin
4. **Public Access** kısmına gidin
5. **Custom Domain** ekle:
   - Domain: `cdn.ezmeo.com`
   - SSL: Enabled (otomatik Let's Encrypt sertifikası)

### 2. DNS Ayarı (Cloudflare DNS)

1. Cloudflare Dashboard → **DNS** → **Records**
2. **Add record**:
   - Type: **CNAME**
   - Name: `cdn`
   - Target: R2 bucket URL (Cloudflare otomatik doldurur veya: `pub-245578082b99402d9e1093b849089bb2.r2.dev`)
   - Proxy status: **Proxied** (turuncu ikonu aktif)
   - TTL: Auto

### 3. Güvenlik Ayarları

Cloudflare dashboard → **SSL/TLS** → **Overview**
- Encryption mode: **Full** veya **Full (strict)**
- Always Use HTTPS: **ON**
- Automatic HTTPS Rewrites: **ON**

### 4. Test Ettikten Sonra

1. Bir görsel URL'ini test edin:
   ```
   https://cdn.ezmeo.com/products/17381234567890-ornek-gorsel.jpg
   ```

2. Görsel yükleniyorsa, admin panel'den yeni bir ürün oluşturun
3. Ürün detay sayfasında görseller görünür olmalı

## Sorun Giderme Checklist

- [ ] Cloudflare R2 → Custom domain eklendi (`cdn.ezmeo.com`)
- [ ] DNS → CNAME record eklendi
- [ ] SSL/TLS ayarları kontrol edildi
- [ ] Görsel URL'leri test edildi (browser'da açılıyor mu?)
- [ ] Admin panel'den yeni ürün görseli yüklendi
- [ ] Ürün sayfasında görseller görünüyor mu?
