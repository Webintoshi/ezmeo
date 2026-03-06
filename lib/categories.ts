import { CategoryInfo } from "@/types/product";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type CategoryAdminInput = Omit<CategoryInfo, "id" | "productCount"> & {
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
  seo_title?: string;
  seo_description?: string;
};

function getSupabase() {
  return getBrowserSupabaseClient();
}

// Supabase'den kategorileri Ã§ek (Client-side)
export async function fetchCategories(): Promise<CategoryInfo[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data?.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "/placeholder.svg",
      icon: cat.icon || "ğŸ“¦",
      productCount: 0,
      parent_id: cat.parent_id,
      sort_order: cat.sort_order || 0,
      is_active: cat.is_active !== false,
      seo_title: cat.seo_title || "",
      seo_description: cat.seo_description || "",
    })) || [];
}

// Server-side iÃ§in kategori Ã§ekme
export async function fetchCategoriesServer() {
  const { createServerClient } = await import("@/lib/supabase");
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

// Slug'a gÃ¶re kategori getir (Client-side)
export async function fetchCategoryBySlug(slug: string): Promise<CategoryInfo | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Error fetching category:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    image: data.image || "/placeholder.svg",
    icon: data.icon || "ğŸ“¦",
    productCount: 0,
  };
}

// =====================================================
// ADMIN PANEL FONKSÄ°YONLARI (Supabase ile)
// =====================================================

// ID'ye gÃ¶re kategori getir (Admin iÃ§in)
export async function getCategoryById(id: string): Promise<CategoryInfo | undefined> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    image: data.image || "/placeholder.jpg",
    icon: data.icon || "ğŸ“¦",
    productCount: 0,
  };
}

// Kategori ekle (Admin iÃ§in)
export async function addCategory(category: CategoryAdminInput): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from("categories").insert({
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    icon: category.icon,
    parent_id: category.parent_id || null,
    sort_order: category.sort_order || 0,
    is_active: category.is_active !== false,
    seo_title: category.seo_title || null,
    seo_description: category.seo_description || null,
  });

  if (error) throw error;
}

// Kategori gÃ¼ncelle (Admin iÃ§in)
export async function updateCategory(id: string, updatedCategory: Partial<CategoryAdminInput>): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("categories")
    .update({
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      description: updatedCategory.description,
      image: updatedCategory.image,
      icon: updatedCategory.icon,
      parent_id: updatedCategory.parent_id || null,
      sort_order: updatedCategory.sort_order || 0,
      is_active: updatedCategory.is_active !== false,
      seo_title: updatedCategory.seo_title || null,
      seo_description: updatedCategory.seo_description || null,
    })
    .eq("id", id);

  if (error) throw error;
}

// Kategori sil (Admin iÃ§in)
export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ESKÄ° getCategories - backwards compatibility
export function getCategories(): CategoryInfo[] {
  console.warn("getCategories() is deprecated. Use fetchCategories() instead.");
  return [];
}

// ESKÄ° getCategoryBySlug - backwards compatibility  
export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  console.warn("getCategoryBySlug() is deprecated. Use fetchCategoryBySlug() instead.");
  return undefined;
}

// BOÅ CATEGORIES ARRAY - ArtÄ±k statik kategori yok!
export const CATEGORIES: CategoryInfo[] = [];
