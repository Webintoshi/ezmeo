# Analytics Live Visitor Tracking - Düzeltme Planı

## Problem Tanımı

Sistemde anlık aktif kullanıcı takibi yanlış çalışıyordu:
- **Sorun 1**: `/admin` slug'ı takip ediliyordu - admin panelinde gezinen kullanıcılar ziyaretçi olarak sayılıyordu
- **Sorun 2**: Google Analytics'e göre 1 kişi varken, sistemde 10 kişi görünüyordu
- **Sorun 3**: Admin kullanıcıları public ziyaretçi olarak sayılıyordu

## Çözüm Stratejisi

Çok katmanlı bir filtreleme sistemi uygulandı:

### 1. Katman - Client-Side Filtreleme (tracking.ts)

**Sorun**: TrackingProvider her sayfada çalışıyordu, admin sayfaları da dahil.

**Çözüm**: `shouldTrackPath()` fonksiyonu eklendi
- `/admin` ile başlayan yolları filtreliyor
- `/api` ve `/_` yollarını da filtreliyor
- Init sırasında ve route değişikliklerinde kontrol ediliyor

```typescript
function shouldTrackPath(pathname: string): boolean {
    if (!pathname) return true;
    const lowerPath = pathname.toLowerCase();
    if (lowerPath.startsWith('/admin')) return false;
    if (lowerPath.startsWith('/api')) return false;
    if (lowerPath.startsWith('/_')) return false;
    return true;
}
```

### 2. Katman - Heartbeat API Filtreleme (heartbeat/route.ts)

**Sorun**: Her 20 saniyede gönderilen heartbeat'te path bilgisi yoktu, sunucu tarafında filtreleme yapılamıyordu.

**Çözüm**:
- `isAdminPath()` fonksiyonu eklendi
- POST handler'da path kontrolü eklendi
- Artık path gönderiliyor ve sunucu tarafında kontrol ediliyor

### 3. Katman - PageView API Filtreleme (pageview/route.ts)

**Sorun**: Page view kayıtları admin sayfaları için de oluşturuluyordu.

**Çözüm**: 
- `isAdminPath()` fonksiyonu eklendi
- Admin sayfaları için kayıt atlanıyor

### 4. Katman - Live Analytics API (live/route.ts)

**Sorun**: Live visitor sayısı hesaplanırken admin session'ları dahil ediliyordu.

**Çözüm**:
- `isAdminPath()` fonksiyonu eklendi
- Sadece son 5 dakikada `/admin` dışında sayfa görüntüleyen session'lar sayılıyor
- İnsan session'ları = bot olmayan + admin dışı pageview yapmış

## Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|------------|
| `lib/tracking.ts` | shouldTrackPath(), client-side path kontrolü |
| `app/api/analytics/heartbeat/route.ts` | isAdminPath(), sunucu tarafı kontrol |
| `app/api/analytics/live/route.ts` | isAdminPath(), session filtreleme |
| `app/api/analytics/pageview/route.ts` | isAdminPath(), pageview kayıt filtreleme |

## Sonuç

- ✅ Admin sayfalarında gezinen kullanıcılar sayılmıyor
- ✅ Sadece gerçek ziyaretçiler (public sayfalar) sayılıyor
- ✅ Google Analytics ile uyumlu rakamlar bekleniyor
- ✅ Çok katmanlı koruma - tek nokta arızası durumunda bile filtreleme çalışıyor
