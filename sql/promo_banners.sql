
INSERT INTO settings (key, value)
VALUES (
  'promo_banners',
  '{
    "banners": [
      {
        "id": 1,
        "image": "/hero banner fıstık ezmeleri.jpg",
        "title": "Doğal Fıstık Ezmesi",
        "subtitle": "Her Gün Taze",
        "buttonText": "İncele",
        "buttonLink": "/koleksiyon/fistik-ezmesi",
        "order": 1
      },
      {
        "id": 2,
        "image": "/Hero_banner_Bir.jpg",
        "title": "Süper Gıdalar",
        "subtitle": "Yeni Geldi!",
        "buttonText": "Keşfet",
        "buttonLink": "/koleksiyon/yeni-urunler",
        "order": 2
      },
      {
        "id": 3,
        "image": "/Findik_Ezmeleri_Kategorisi.webp",
        "title": "Saf Organik",
        "subtitle": "Koleksiyon",
        "buttonText": "Göz At",
        "buttonLink": "/koleksiyon/kuruyemis",
        "order": 3
      }
    ]
  }'
)
ON CONFLICT (key) DO NOTHING;
