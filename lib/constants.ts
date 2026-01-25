import { CategoryInfo, ProductCategory } from "@/types/product";

// Site Bilgileri
export const SITE_NAME = "Ezmeo";
export const SITE_TAGLINE = "Doğalın En Saf Hali";
export const SITE_DESCRIPTION =
  "Doğal fıstık, fındık, badem ve ceviz ezmeleri Ezmeo'da! Katkısız içerik, yüksek protein, hızlı kargo.";

// İletişim Bilgileri
export const CONTACT_INFO = {
  email: "info@ezmeo.com",
  phone: "+90 555 123 4567",
  whatsapp: "+90 555 123 4567",
  address: "Organize Sanayi Bölgesi, Merkez, Türkiye",
};

// Sosyal Medya
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/ezmeo",
  facebook: "https://facebook.com/ezmeo",
  twitter: "https://twitter.com/ezmeo",
  youtube: "https://youtube.com/@ezmeo",
};

// Kargo Bilgileri
export const SHIPPING_THRESHOLD = 350; // Ücretsiz kargo sınırı (TL)
export const SHIPPING_COST = 29.9; // Standart kargo ücreti (TL)

// Kategoriler
export const CATEGORIES: CategoryInfo[] = [
  {
    id: "findik",
    name: "Fındık Ezmeleri",
    slug: "findik-ezmeleri",
    description: "Giresun kalitesi fıstık ezmeleri",
    image: "/images/categories/findik.jpg",
    icon: "🌰",
    productCount: 6,
  },
  {
    id: "fistik",
    name: "Fıstık Ezmeleri",
    slug: "fistik-ezmeleri",
    description: "Yer fıstığından doğal ezme",
    image: "/images/categories/fistik.jpg",
    icon: "🥜",
    productCount: 4,
  },
  {
    id: "antep-fistigi",
    name: "Antep Fıstığı Ezmeleri",
    slug: "antep-fistigi-ezmeleri",
    description: "Gaziantep'in lezzeti",
    image: "/images/categories/antep-fistigi.jpg",
    icon: "✨",
    productCount: 4,
  },
  {
    id: "badem",
    name: "Badem Ezmeleri",
    slug: "badem-ezmeleri",
    description: "Kaliforniya bademi",
    image: "/images/categories/badem.jpg",
    icon: "🌰",
    productCount: 4,
  },
  {
    id: "ceviz",
    name: "Ceviz Ezmeleri",
    slug: "ceviz-ezmeleri",
    description: "Yağ cevizi",
    image: "/images/categories/ceviz.jpg",
    icon: "🥔",
    productCount: 4,
  },
  {
    id: "kaju",
    name: "Kaju Ezmeleri",
    slug: "kaju-ezmeleri",
    description: "Hindistan cevizinden",
    image: "/images/categories/kaju.jpg",
    icon: "🥥",
    productCount: 4,
  },
  {
    id: "paketler",
    name: "Ezme Paketleri",
    slug: "ezme-paketleri",
    description: "Çeşitli ezmeleri bir arada",
    image: "/images/categories/paketler.jpg",
    icon: "🎁",
    productCount: 3,
  },
];

// URL Yolları
export const ROUTES = {
  home: "/",
  shop: "/shop",
  products: "/urunler",
  category: (slug: string) => `/kategori/${slug}`,
  product: (slug: string) => `/urunler/${slug}`,
  cart: "/sepet",
  checkout: "/odeme",
  about: "/hakkimizda",
  contact: "/iletisim",
  blog: "/blog",
} as const;

// Ürün Özellik Rozetleri
export const PRODUCT_BADGES = {
  vegan: { label: "Vegan", color: "bg-green-100 text-green-800" },
  glutenFree: { label: "Glutensiz", color: "bg-yellow-100 text-yellow-800" },
  sugarFree: { label: "Şekersiz", color: "bg-blue-100 text-blue-800" },
  highProtein: { label: "Yüksek Protein", color: "bg-purple-100 text-purple-800" },
  new: { label: "Yeni", color: "bg-pink-100 text-pink-800" },
  discount: { label: "İndirim", color: "bg-red-100 text-red-800" },
};

// Nav Linkleri
export const NAV_LINKS = [
  { name: "Ana Sayfa", href: ROUTES.home },
  { name: "Ürünler", href: ROUTES.products },
  { name: "Kategoriler", href: ROUTES.shop },
  { name: "Hakkımızda", href: ROUTES.about },
  { name: "İletişim", href: ROUTES.contact },
];

// Footer Linkleri
export const FOOTER_LINKS = {
  categories: [
    { name: "Antep Fıstığı Ezmesi", href: ROUTES.category("antep-fistigi-ezmeleri") },
    { name: "Fındık Ezmesi", href: ROUTES.category("findik-ezmeleri") },
    { name: "Fıstık Ezmesi", href: ROUTES.category("fistik-ezmeleri") },
    { name: "Ceviz Ezmesi", href: ROUTES.category("ceviz-ezmeleri") },
    { name: "Kaju Ezmesi", href: ROUTES.category("kaju-ezmeleri") },
    { name: "Badem Ezmesi", href: ROUTES.category("badem-ezmeleri") },
  ],
  useful: [
    { name: "Süper Kampanya", href: "/kampanya" },
    { name: "Tüm Ürünler", href: ROUTES.products },
    { name: "İletişim", href: ROUTES.contact },
    { name: "Blog", href: ROUTES.blog },
  ],
  policies: [
    { name: "Gizlilik Anlaşması", href: "/gizlilik" },
    { name: "Mesafeli Satış", href: "/mesafeli-satis" },
    { name: "Kargo & İade", href: "/kargo-iade" },
    { name: "KVKK", href: "/kvkk" },
  ],
};

// Müşteri Yorumları
export const TESTIMONIALS = [
  {
    id: "1",
    name: "Feriha S.",
    role: "Müşteri",
    text: "Öğrencilik dönemimden beridir düzenli alıyorum ve tadı hiç değişmiyor hep aynı severek yiyorum iş yerinde tatlı krizlerine çözüm oluyor.",
    rating: 5,
    image: "/images/testimonials/feriha.jpg",
  },
  {
    id: "2",
    name: "Ahmet E.",
    role: "Diyetisyen",
    text: "PT olduğum için sürekli şekersiz ürün danışanlar oluyor yıllardır önerdiğim tek marka lezzet ve fiyat olarak en iyisi.",
    rating: 5,
    image: "/images/testimonials/ahmet.jpg",
  },
  {
    id: "3",
    name: "Aysel Kıraz",
    role: "Vegan",
    text: "Ezmeo'nun vegan.org tarafından tescilli olması sebebi ile tamamen güvenerek alıyorum. Veganlara tavsiye ediyorum.",
    rating: 5,
    image: "/images/testimonials/aysel.jpg",
  },
  {
    id: "4",
    name: "Arıfa Cihangir",
    role: "Müşteri",
    text: "Lezzet kıvam harika gerçekten. Alman arkadaşım tarafından önerilmişti yurtdışında popüler bir marka.",
    rating: 5,
    image: "/images/testimonials/arifa.jpg",
  },
  {
    id: "5",
    name: "Tuba Çise Z.",
    role: "Fuar Yöneticisi",
    text: "İlk gördüğümde İtalyan marka sanmıştım. Türk markası olmasına şaşırdığım marka. Fındık ezmeleri gerçekten harika.",
    rating: 5,
    image: "/images/testimonials/tuba.jpg",
  },
  {
    id: "6",
    name: "Ahmet Canbay",
    role: "Sporcu",
    text: "Profesyonel sporcu olarak birinci tercihim olan marka özellikle ballı badem ezmesine bayılıyorum şekersiz ama gerçekten tatlı.",
    rating: 5,
    image: "/images/testimonials/ahmet-c.jpg",
  },
];
