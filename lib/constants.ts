import { CategoryInfo, ProductCategory } from "@/types/product";

// Site Bilgileri
export const SITE_NAME = "Ezmeo";
export const SITE_TAGLINE = "Doğalın En Saf Hali";
export const SITE_DESCRIPTION =
  "Doğal fıstık ezmeleri, fındık ezmeleri ve kuruyemişler Ezmeo'da! Katkısız içerik, yüksek protein, hızlı kargo.";

// İletişim Bilgileri
export const CONTACT_INFO = {
  email: "ezmeoshopify@proton.me",
  phone: "+90 555 123 4567",
  whatsapp: "+90 555 123 4567",
  address: "Akyazı Mahallesi 873. Sokak No:2 Daire:4, Altınordu / Ordu, Türkiye",
};

// Sosyal Medya
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/ezmeo",
  facebook: "https://facebook.com/ezmeo",
  twitter: "https://twitter.com/ezmeo",
  youtube: "https://youtube.com/@ezmeo",
};

// Kargo Bilgileri
export const SHIPPING_THRESHOLD = 500; // Ücretsiz kargo sınırı (TL)
export const SHIPPING_COST = 29.9; // Standart kargo ücreti (TL)

// Kargo Yöntemleri
export const SHIPPING_METHODS = [
  {
    id: "standard",
    name: "Standart Kargo",
    description: "2-3 iş günü içinde teslimat",
    cost: 29.9,
  },
  {
    id: "express",
    name: "Hızlı Kargo",
    description: "1-2 iş günü içinde teslimat",
    cost: 49.9,
  },
];

// Türkiye İlleri
export const TURKISH_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yalova", "Yozgat",
  "Zonguldak",
];

// Kategoriler
export const CATEGORIES: CategoryInfo[] = [
  {
    id: "fistik-ezmesi",
    name: "Fıstık Ezmeleri",
    slug: "fistik-ezmesi",
    description: "Akdeniz ve Ege bölgelerinden en kaliteli yer fıstıklarından üretilen doğal ezmeler",
    image: "/images/categories/fistik-ezmesi.jpg",
    icon: "🥜",
    productCount: 4,
  },
  {
    id: "findik-ezmesi",
    name: "Fındık Ezmeleri",
    slug: "findik-ezmesi",
    description: "Karadeniz bölgesinin en iyi fındıklarından üretilen ezmeler",
    image: "/images/categories/findik-ezmesi.jpg",
    icon: "🌰",
    productCount: 2,
  },
  {
    id: "kuruyemis",
    name: "Kuruyemişler",
    slug: "kuruyemis",
    description: "Çiğ ve kavrulmuş doğal kuruyemişler",
    image: "/images/categories/kuruyemisler.jpg",
    icon: "🥔",
    productCount: 5,
  },
];

// URL Yolları
export const ROUTES = {
  home: "/",
  allProducts: "/urunler",
  products: "/urunler",
  category: (slug: string) => `/kategori/${slug}`,
  product: (slug: string) => `/urunler/${slug}`,
  cart: "/sepet",
  checkout: "/odeme",
  about: "/hakkimizda",
  contact: "/iletisim",
  blog: "/blog",
  wishlist: "/favoriler",
  login: "/giris",
  register: "/kayit",
} as const;

// Ürün Özellik Rozetleri
export const PRODUCT_BADGES = {
  vegan: { label: "Vegan", color: "bg-primary/10 text-primary" },
  glutenFree: { label: "Glutensiz", color: "bg-primary/10 text-primary" },
  sugarFree: { label: "Şekersiz", color: "bg-primary/10 text-primary" },
  highProtein: { label: "Yüksek Protein", color: "bg-primary/10 text-primary" },
  new: { label: "Yeni", color: "bg-primary/10 text-primary" },
  discount: { label: "İndirim", color: "bg-primary/10 text-primary" },
};

// Nav Linkleri
export const NAV_LINKS = [
  { name: "Ana Sayfa", href: ROUTES.home },
  { name: "Tüm Ürünler", href: ROUTES.allProducts },
  { name: "Fıstık Ezmeleri", href: ROUTES.category("fistik-ezmesi") },
  { name: "Fındık Ezmeleri", href: ROUTES.category("findik-ezmesi") },
  { name: "Kuruyemişler", href: ROUTES.category("kuruyemis") },
  { name: "SSS", href: "/sss" },
];

// Footer Linkleri
export const FOOTER_LINKS = {
  categories: [
    { name: "Fıstık Ezmeleri", href: ROUTES.category("fistik-ezmesi") },
    { name: "Fındık Ezmeleri", href: ROUTES.category("findik-ezmesi") },
    { name: "Kuruyemişler", href: ROUTES.category("kuruyemis") },
  ],
  useful: [
    { name: "Ana Sayfa", href: ROUTES.home },
    { name: "Tüm Ürünler", href: ROUTES.allProducts },
    { name: "SSS", href: "/sss" },
  ],
  policies: [
    { name: "Gizlilik Sözleşmesi", href: "/gizlilik" },
    { name: "İade Sözleşmesi", href: "/iade" },
    { name: "Hizmet Şartları", href: "/sartlar" },
    { name: "Kargo Politikası", href: "/kargo" },
  ],
};

// Müşteri Yorumları
export const TESTIMONIALS = [
  {
    id: "1",
    name: "Sadullah",
    role: "Mağaza Değerlendirmesi",
    text: "Ürünler kaliteli ve taze. Kesinlikle tavsiye ediyorum.",
    rating: 5,
    image: "/images/testimonials/sadullah.jpg",
  },
  {
    id: "2",
    name: "Sadullah",
    role: "Ürün Değerlendirmesi",
    text: "Şekersiz Fıstık Ezmesi 450G harika. Lezzeti gerçekten doğal ve taze.",
    rating: 5,
    image: "/images/testimonials/sadullah2.jpg",
  },
  {
    id: "3",
    name: "Cem Devran",
    role: "Ürün Değerlendirmesi",
    text: "Şekersiz Fıstık Ezmesi 450G siparişim çok hızlı geldi. Teşekkürler Ezmeo!",
    rating: 5,
    image: "/images/testimonials/cem.jpg",
  },
];
