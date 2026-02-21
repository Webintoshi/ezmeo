# AI Botları Kontrol Stratejisi - Ezmeo

## 🎯 Amaç
Yapay zeka botlarının (ChatGPT, Claude, Perplexity vb.) siteyi taramasını kontrol altına almak, istenmeyen içerik tüketimini önlemek ve gerektiğinde sınırlamak.

## 📊 Mevcut Durum
- ✅ robots.ts dosyası mevcut
- ✅ Bazı AI botları için kurallar tanımlı (GPTBot, ClaudeBot, vb.)
- ✅ Sitemap yapısı otomatik
- ❌ Rate limiting yok
- ❌ Bot trafik analizi yok
- ❌ Middleware seviyesinde kontrol yok

---

## 🛡️ Önerilen Kontrol Katmanları

### 1. Robots.txt Geliştirmesi (Hazır - app/robots.ts)
**Mevcut Durum:** Temel yapılandırma var
**Eksikler:**
- Daha fazla AI botu eklenebilir
- Crawl-delay değerleri optimize edilebilir
- Daha spesifik kurallar eklenebilir

**Eklenmesi Gereken Botlar:**
```
- Cohere-ai
- Diffbot
- FacebookBot
- ImagesiftBot
- Meta-ExternalAgent
- OAI-SearchBot
- PetalBot
- YouBot
```

### 2. Middleware Rate Limiting (Önerilen)
**Dosya:** `middleware.ts`
**Amaç:** AI botlarına özel rate limit uygulamak

**Özellikler:**
- Her IP için dakikada maksimum 10 istek
- AI botları için özel user-agent kontrolü
- Aşırı trafik durumunda 429 (Too Many Requests) döndürme
- IP bazlı geçici engelleme (15 dk)

**Avantajları:**
- Sunucu yükünü azaltır
- DDoS benzeri bot taramalarını engeller
- Adil kullanım sağlar

### 3. Sitemap.xml Bot Kontrolü (Önerilen)
**Amaç:** AI botlarının sitemap üzerinden erişebileceği URL'leri sınırlamak

**Yaklaşım:**
- Ayrı bir "ai-sitemap.xml" oluşturmak (sadece AI'ların görmesini istediğimiz içerikler)
- Veya robots.txt'de sitemap referansını kaldırmak
- Veya sitemap'e parola koruması eklemek (teknik olarak zor)

**Öneri:** Şu anki yapıda kalmak daha iyi çünkü sitemap SEO için kritik.

### 4. Meta Tagler ile İçerik Koruma (Önerilen)
**Dosyalar:** Tüm layout.tsx ve sayfalar
**Amaç:** Sayfa bazlı AI taramasını kontrol etmek

**Kullanılabilir Tagler:**
```html
<!-- AI botları için genel kontrol (Google'ın önerisi) -->
<meta name="robots" content="noai, noimageai">

<!-- Arşivleme engelleme -->
<meta name="robots" content="noarchive">

<!-- Önbellek kontrolü -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
```

**Not:** `noai` tagi henüz standart değil, tarayıcılar tarafından dikkate alınmayabilir.

### 5. Cloudflare WAF Kuralları (Önerilen - Eğer Cloudflare varsa)
**Amaç:** DNS seviyesinde bot kontrolü

**Yapılandırma:**
- AI botları için özel WAF kuralı
- Rate limiting rule (dakikada 5 istek)
- Challenge modülü (botlar için CAPTCHA)
- Bot Management özelliği

### 6. API Endpoint Koruması (Önerilen)
**Dosyalar:** Tüm `/api/*` route'ları
**Amaç:** AI botlarının API'yi kullanmasını engellemek

**Özellikler:**
- API key gereksinimi
- IP bazlı rate limiting
- CORS kontrolü
- Bot detection

---

## 📋 Uygulama Öncelik Sırası

### Faz 1: Hızlı Kazanımlar (1-2 saat)
1. ✅ Robots.txt'i güncelle (daha fazla bot ekle)
2. ✅ Admin panelde bot trafik göstergesi ekle
3. ✅ Sitemap yönetimi sayfasına AI bilgilendirme mesajı ekle

### Faz 2: Middleware Koruması (2-3 saat)
1. Rate limiting middleware'i geliştir
2. AI bot detection algoritması ekle
3. Loglama sistemi kur

### Faz 3: İleri Seviye (Opsiyonel)
1. Cloudflare entegrasyonu
2. IP bazlı kalıcı engelleme
3. Bot trafik raporlama paneli

---

## 🤖 Bilinen AI Bot User-Agent Listesi

```
# OpenAI
GPTBot
ChatGPT-User
OAI-SearchBot

# Anthropic
ClaudeBot
anthropic-ai

# Google
Google-Extended

# Perplexity
PerplexityBot

# Diğerleri
CCBot (Common Crawl)
Diffbot
FacebookBot
Meta-ExternalAgent
ImagesiftBot
PetalBot
YouBot
Cohere-ai
```

---

## ⚠️ Önemli Notlar

1. **Robots.txt Gönüllü Uyum:** AI botları robots.txt'i gönüllü olarak takip eder. Zorlayıcı değildir.

2. **SEO Etkisi:** Aşırı kısıtlama SEO'yu olumsuz etkileyebilir. Dengeli olunmalı.

3. **Rate Limiting:** Gerçek kullanıcıları etkilememek için dikkatli yapılandırılmalı.

4. **Yasal Durum:** AI botlarının taramasını tamamen engellemek yasal bir gri alandır. Robots.txt en güvenli yöntemdir.

---

## ✅ Özet Tavsiye

**Hemen Yapılması Gerekenler:**
1. Robots.txt'i mevcut listenin 2 katı botla güncelle
2. Middleware'e basit bir rate limiter ekle (dakika başı 20 istek)
3. Admin panelde "AI Bot Trafik" kartı göster

**Orta Vadede:**
1. Cloudflare Bot Management düşün
2. Log analizi sistemi kur

Bu planı uygulamak ister misiniz? Hangi fazla başlayalım?
