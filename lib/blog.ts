import { BlogPost, BlogCategoryInfo, TopicType, ContentStatus } from "@/types/blog";

export const BLOG_CATEGORIES: BlogCategoryInfo[] = [
  {
    id: "saglik",
    name: "Sağlık",
    slug: "saglik",
    description: "Sağlıklı yaşam ve beslenme ipuçları",
    icon: "❤️",
  },
  {
    id: "tarifler",
    name: "Tarifler",
    slug: "tarifler",
    description: "Lezzetli ve sağlıklı tarifler",
    icon: "🍽️",
  },
  {
    id: "beslenme",
    name: "Beslenme",
    slug: "beslenme",
    description: "Beslenme bilgileri ve öneriler",
    icon: "🥗",
  },
  {
    id: "yasam",
    name: "Yaşam",
    slug: "yasam",
    description: "Yaşam tarzı ve wellness",
    icon: "🌟",
  },
  {
    id: "haberler",
    name: "Haberler",
    slug: "haberler",
    description: "Ezmeo'dan haberler",
    icon: "📰",
  },
];

// Önerilen Pillar Konuları (Ezmeo için)
export const SUGGESTED_PILLARS = [
  {
    id: "fistik-ezmesi",
    title: "Fıstık Ezmesi Rehberi",
    description: "Fıstık ezmesinin faydaları, kullanımı ve tarifleri",
    targetKeywords: ["fıstık ezmesi", "doğal fıstık ezmesi", "organik fıstık ezmesi"],
    suggestedClusters: [
      "Fıstık Ezmesi Kaç Kalori? Besin Değerleri",
      "Organik vs Normal Fıstık Ezmesi Farkı",
      "Fıstık Ezmesi ile Yapılan Tatlılar",
      "Evde Fıstık Ezmesi Nasıl Yapılır?",
      "Fıstık Ezmesi Zayıflatır mı?",
    ],
  },
  {
    id: "kahvaltilik-soslar",
    title: "Kahvaltılık Soslar ve Ezmeler",
    description: "Kahvaltınızı zenginleştirecek doğal soslar",
    targetKeywords: ["kahvaltılık sos", "kahvaltılık ezme", "doğal kahvaltı sosları"],
    suggestedClusters: [
      "Kahvaltıya Uygun 10 Doğal Sos",
      "Acuka Nasıl Yapılır? Ev Tarifi",
      "Ceviz Ezmesi Tarifi ve Faydaları",
      "Kahvaltılık Ezme Çeşitleri",
      "Glutensiz Kahvaltılık Soslar",
    ],
  },
  {
    id: "vegan-beslenme",
    title: "Vegan Beslenme ve Ezmeler",
    description: "Vegan beslenmede ezme kullanımı",
    targetKeywords: ["vegan ezme", "bitkisel protein", "vegan beslenme"],
    suggestedClusters: [
      "Vegan Fıstık Ezmesi Nedir?",
      "Bitkisel Protein Kaynakları",
      "Vegan Kahvaltı Önerileri",
      "Vegan Tatlı Tarifleri",
      "Vegan Beslenme Rehberi",
    ],
  },
  {
    id: "saglikli-atistirmaliklar",
    title: "Sağlıklı Atıştırmalıklar",
    description: "Sağlıklı beslenme ve atıştırmalık önerileri",
    targetKeywords: ["sağlıklı atıştırmalık", "doğal atıştırmalık", "fit atıştırmalık"],
    suggestedClusters: [
      "Sağlıklı Atıştırmalık Önerileri",
      "Fit Beslenme ve Ezmeler",
      "Proteinli Atıştırmalıklar",
      "Okul İçin Sağlıklı Atıştırmalıklar",
      "Diyet Atıştırmalık Tarifleri",
    ],
  },
  {
    id: "dogal-besinler",
    title: "Doğal ve Katkısız Besinler",
    description: "Katkısız, doğal besinler ve sağlıklı yaşam",
    targetKeywords: ["doğal besinler", "katkısız ürünler", "organik gıda"],
    suggestedClusters: [
      "Katkısız Gıda Nedir? Nasıl Anlaşılır?",
      "Organik Ürünlerin Faydaları",
      "Doğal Beslenme Rehberi",
      "Şekersiz Ürünler ve Alternatifler",
      "Doğal Tatlandırıcılar",
    ],
  },
];

// İdeal kelime sayıları
export const CONTENT_GUIDELINES = {
  pillar: {
    minWords: 2000,
    idealWords: 2500,
    description: "Kapsamlı rehber - ana konu hakkında genel bilgi",
  },
  cluster: {
    minWords: 1000,
    idealWords: 1500,
    description: "Detaylı içerik - spesifik alt konu",
  },
  standalone: {
    minWords: 600,
    idealWords: 1000,
    description: "Bağımsız blog yazısı",
  },
};

// SEO Checklist
export const SEO_CHECKLIST = [
  { id: "title", label: "SEO Başlığı (60 karakter)", weight: 15 },
  { id: "meta", label: "Meta Açıklama (160 karakter)", weight: 10 },
  { id: "heading", label: "H1 Başlık", weight: 10 },
  { id: "subheadings", label: "H2/H3 Alt Başlıklar", weight: 10 },
  { id: "keyword", label: "Anahtar Kelime Kullanımı", weight: 15 },
  { id: "internal", label: "İç Link (diğer yazılara)", weight: 10 },
  { id: "product", label: "Ürün Linki (ezme ürünleri)", weight: 10 },
  { id: "image", label: "Görsel ve Alt Metni", weight: 10 },
  { id: "wordcount", label: "Hedef Kelime Sayısı", weight: 10 },
];

export const BLOG_POSTS: BlogPost[] = [];

export function getBlogPosts(): BlogPost[] {
  return BLOG_POSTS.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );
}

export function getFeaturedPosts(limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.featured)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.category === category).sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter(
    (p) => p.category === post.category && p.id !== post.id
  )
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

export function searchPosts(query: string): BlogPost[] {
  const q = query.toLowerCase();
  return BLOG_POSTS.filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

// Yeni: Pillar bazlı fonksiyonlar
export function getPillars(): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.topicType === "pillar");
}

export function getClustersByPillar(pillarId: string): BlogPost[] {
  return BLOG_POSTS.filter(
    (post) => post.topicType === "cluster" && post.pillarId === pillarId
  );
}

export function calculateSEOScore(post: Partial<BlogPost>): number {
  let score = 0;
  const guidelines = CONTENT_GUIDELINES[post.topicType || "standalone"];
  
  // Kelime sayısı kontrolü
  if (post.wordCount && post.wordCount >= guidelines.minWords) {
    score += 10;
    if (post.wordCount >= guidelines.idealWords) score += 5;
  }
  
  // Anahtar kelime kontrolü
  if (post.primaryKeyword && post.primaryKeyword.length > 0) score += 15;
  if (post.targetKeywords && post.targetKeywords.length >= 3) score += 10;
  
  // İç link kontrolü
  if (post.internalLinks && post.internalLinks.length > 0) score += 10;
  if (post.relatedProducts && post.relatedProducts.length > 0) score += 10;
  
  // Temel alanlar
  if (post.title && post.title.length >= 30) score += 15;
  if (post.excerpt && post.excerpt.length >= 100) score += 10;
  if (post.coverImage) score += 10;
  if (post.tags && post.tags.length >= 3) score += 5;
  
  return Math.min(score, 100);
}

export function getContentProgress(): {
  pillar: { total: number; target: number };
  cluster: { total: number; target: number };
  standalone: { total: number };
} {
  const pillars = getPillars();
  const allClusters = BLOG_POSTS.filter((p) => p.topicType === "cluster");
  const standalone = BLOG_POSTS.filter((p) => p.topicType === "standalone");
  
  return {
    pillar: { total: pillars.length, target: SUGGESTED_PILLARS.length },
    cluster: { total: allClusters.length, target: pillars.length * 5 }, // Her pillar için 5 cluster hedefi
    standalone: { total: standalone.length },
  };
}
