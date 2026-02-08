# 🚀 Ezmeo Deployment Guide

Bu rehber, projeyi GitHub'a pushlayıp Vercel'de yayınlamak ve Supabase + Cloudflare R2 yapılandırması için adım adım talimatlar içerir.

---

## 📋 Deployment Checklist

### 1. GitHub'a Push

```bash
# Projeyi staging'den production'a hazırla
git add .
git commit -m "feat: AJAX search, animated cart, checkout UI improvements"
git push origin main
```

### 2. Vercel Yapılandırması

1. [Vercel Dashboard](https://vercel.com) > **New Project**
2. GitHub repo'nuzu seçin: `Ezmeo`
3. **Framework Preset**: Next.js (otomatik algılanmalı)
4. **Environment Variables** ekleyin (`.env.example` dosyasına bakın):

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
   | `NEXT_PUBLIC_SITE_URL` | `https://ezmeo.com` |
   | `R2_PUBLIC_URL` | `https://assets.ezmeo.com` |

5. **Deploy** butonuna tıklayın

---

### 3. Supabase Kurulumu

1. [Supabase Dashboard](https://supabase.com/dashboard) > **New Project**
2. Proje adı: `ezmeo-production`
3. **Database Password** oluşturun ve kaydedin
4. **Settings > API** bölümünden:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (sadece backend)

#### Veritabanı Tabloları (Opsiyonel - Gelecek için)

```sql
-- Siparişler tablosu
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ürün stokları (opsiyonel)
CREATE TABLE product_inventory (
  product_id TEXT PRIMARY KEY,
  stock INTEGER NOT NULL DEFAULT 0
);
```

---

### 4. Cloudflare R2 Kurulumu

1. [Cloudflare Dashboard](https://dash.cloudflare.com) > **R2**
2. **Create Bucket**: `ezmeo-assets`
3. **Settings** > **Public Access** etkinleştirin
4. **Manage R2 API Tokens** > **Create Token**:
   - Permission: Object Read & Write
   - Bucket: `ezmeo-assets`
5. Token bilgilerini Vercel'e ekleyin:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`

#### R2 Public URL Ayarı

Custom domain kullanmak için:

1. **R2 Bucket Settings** > **Custom Domain**
2. `assets.ezmeo.com` gibi bir subdomain ekleyin
3. DNS ayarlarını yapılandırın

---

## ✅ Verification Steps

Deployment sonrası kontrol edin:

1. **Ana Sayfa**: `https://ezmeo.com` yüklendiğini doğrulayın
2. **Ürün Sayfaları**: `/urunler` listesi görünüyor mu?
3. **Sepet**: Ürün ekleyip sepete gitmeyi test edin
4. **Ödeme**: `/odeme` sayfası düzgün açılıyor mu?
5. **AJAX Arama**: Header'da arama yaparak ürün listesinin anlık geldiğini test edin

---

## 🔒 Güvenlik Notları

- `.env.local` dosyasını **asla** Git'e pushlamayın
- Vercel Environment Variables kullanarak production secrets'ları yönetin
- `SUPABASE_SERVICE_ROLE_KEY` sadece server-side kullanın
