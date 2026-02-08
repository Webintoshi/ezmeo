import { CategoryInfo, ProductCategory } from "@/types/product";
import { getProductsByCategory } from "./products";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "fistik-ezmesi",
    name: "Fıstık Ezmesi",
    slug: "fistik-ezmesi",
    description: "Akdeniz ve Ege bölgelerinden en kaliteli yer fıstıklarından üretilen, doğal ve katkısız fıstık ezmeleri.",
    image: "/images/categories/fistik-ezmesi.jpg",
    icon: "🥜",
    productCount: 0,
  },
  {
    id: "findik-ezmesi",
    name: "Fındık Ezmesi",
    slug: "findik-ezmesi",
    description: "Giresun ve Ordu'nun en kaliteli fındıklarından üretilen, kremalı ve lezzetli fındık ezmeleri.",
    image: "/images/categories/findik-ezmesi.jpg",
    icon: "🌰",
    productCount: 0,
  },
  {
    id: "kuruyemis",
    name: "Kuruyemiş",
    slug: "kuruyemis",
    description: "Doğal ve taze kuruyemiş çeşitleri. Çiğ ve kavrulmuş seçeneklerle sağlıklı atıştırmalıklar.",
    image: "/images/categories/kuruyemis.jpg",
    icon: "🥜",
    productCount: 0,
  },
];

let categories: CategoryInfo[] = [...CATEGORIES];

export function getCategories(): CategoryInfo[] {
  return categories.map((cat) => ({
    ...cat,
    productCount: getProductsByCategory(cat.id).length,
  }));
}

export function getCategoryById(id: string): CategoryInfo | undefined {
  return categories.find((cat) => cat.id === id);
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function addCategory(category: Omit<CategoryInfo, "productCount">): void {
  categories.push({
    ...category,
    productCount: 0,
  });
}

export function updateCategory(id: string, updatedCategory: Partial<CategoryInfo>): void {
  const index = categories.findIndex((cat) => cat.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updatedCategory };
  }
}

export function deleteCategory(id: string): void {
  const index = categories.findIndex((cat) => cat.id === id);
  if (index !== -1) {
    categories.splice(index, 1);
  }
}
