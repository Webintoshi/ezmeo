export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: BlogCategory;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
  readTime: number; // dakika
  featured: boolean;
  views: number;
  status: "draft" | "published";
}

export type BlogCategory =
  | "saglik"
  | "tarifler"
  | "beslenme"
  | "yasam"
  | "haberler";

export interface BlogCategoryInfo {
  id: BlogCategory;
  name: string;
  slug: string;
  description: string;
  icon: string;
}
