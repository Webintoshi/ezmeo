import { supabase, createServerClient, Product, ProductVariant } from "@/lib/supabase";

// =====================================================
// PRODUCT QUERIES
// =====================================================

/**
 * Get all products with their variants
 */
export async function getProducts() {
    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*)
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Get featured products
 */
export async function getFeaturedProducts() {
    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*)
    `)
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Get bestseller products
 */
export async function getBestsellerProducts() {
    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*)
    `)
        .eq("is_bestseller", true)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string) {
    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*)
    `)
        .eq("slug", slug)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string) {
    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*)
    `)
        .eq("category", category)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Search products
 */
export async function searchProducts(query: string) {
    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*)
    `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);

    if (error) throw error;
    return data;
}

// =====================================================
// ADMIN PRODUCT MUTATIONS (Server-side only)
// =====================================================

/**
 * Create a new product (admin)
 */
export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
    const serverClient = createServerClient();
    const { data, error } = await serverClient
        .from("products")
        .insert(product)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a product (admin)
 */
export async function updateProduct(id: string, updates: Partial<Product>) {
    const serverClient = createServerClient();
    const { data, error } = await serverClient
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a product (admin)
 */
export async function deleteProduct(id: string) {
    const serverClient = createServerClient();
    const { error } = await serverClient
        .from("products")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}

/**
 * Add variant to product (admin)
 */
export async function addProductVariant(variant: Omit<ProductVariant, "id" | "created_at">) {
    const serverClient = createServerClient();
    const { data, error } = await serverClient
        .from("product_variants")
        .insert(variant)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update variant (admin)
 */
export async function updateProductVariant(id: string, updates: Partial<ProductVariant>) {
    const serverClient = createServerClient();
    const { data, error } = await serverClient
        .from("product_variants")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete variant (admin)
 */
export async function deleteProductVariant(id: string) {
    const serverClient = createServerClient();
    const { error } = await serverClient
        .from("product_variants")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}
