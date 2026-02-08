import { BlogPost, BlogCategoryInfo } from "@/types/blog";

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
