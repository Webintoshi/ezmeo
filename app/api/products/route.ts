import { NextRequest, NextResponse } from "next/server";
import {
    getProducts,
    getFeaturedProducts,
    getBestsellerProducts,
    getProductBySlug,
    getProductsByCategory,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from "@/lib/db/products";

// GET /api/products - Get all products or filter by query params
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const featured = searchParams.get("featured");
        const bestseller = searchParams.get("bestseller");
        const category = searchParams.get("category");
        const slug = searchParams.get("slug");
        const search = searchParams.get("search");

        let products;

        if (id) {
            // Fetch single product by ID
            const { createServerClient } = await import("@/lib/supabase");
            const supabase = createServerClient();
            const { data, error } = await supabase
                .from("products")
                .select("*, variants:product_variants(*)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, product: data });
        } else if (slug) {
            products = await getProductBySlug(slug);
            return NextResponse.json({ success: true, product: products });
        } else if (featured === "true") {
            products = await getFeaturedProducts();
        } else if (bestseller === "true") {
            products = await getBestsellerProducts();
        } else if (category) {
            products = await getProductsByCategory(category);
        } else if (search) {
            products = await searchProducts(search);
        } else {
            products = await getProducts();
        }

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { variants, ...productData } = body;

        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        // 1. Ana ürünü oluştur
        const { data: product, error: productError } = await supabase
            .from("products")
            .insert({
                name: productData.name,
                slug: productData.slug,
                description: productData.description || null,
                short_description: productData.short_description || null,
                images: productData.images || [],
                category: productData.category || null,
                subcategory: productData.subcategory || null,
                tags: productData.tags || [],
                is_featured: productData.is_featured || false,
                is_bestseller: productData.is_new || false,  // is_new yerine is_bestseller kullan
                rating: productData.rating || 5,
                review_count: productData.review_count || 0,
            })
            .select()
            .single();

        if (productError) throw productError;

        // 2. Varyantları ekle
        if (variants && Array.isArray(variants) && variants.length > 0) {
            const variantsToInsert = variants.map((v: any) => ({
                product_id: product.id,
                name: v.name,
                weight: v.weight,
                price: v.price,
                original_price: v.original_price || null,
                stock: v.stock,
                sku: v.sku,
            }));

            const { error: variantsError } = await supabase
                .from("product_variants")
                .insert(variantsToInsert);

            if (variantsError) throw variantsError;
        }

        // 3. Tam ürünü döndür
        const { data: fullProduct } = await supabase
            .from("products")
            .select("*, variants:product_variants(*)")
            .eq("id", product.id)
            .single();

        return NextResponse.json({ success: true, product: fullProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to create product" },
            { status: 500 }
        );
    }
}

// PUT /api/products - Update a product
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, variants, ...updates } = body;

        console.log("PUT /api/products - ID:", id);
        console.log("PUT /api/products - Updates:", updates);
        console.log("PUT /api/products - Variants:", variants);

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        // 1. Ana ürünü güncelle (variants olmadan)
        const { data: product, error: productError } = await supabase
            .from("products")
            .update({
                name: updates.name,
                slug: updates.slug,
                description: updates.description,
                short_description: updates.short_description,
                images: updates.images,
                category: updates.category,
                subcategory: updates.subcategory,
                tags: updates.tags,
                is_featured: updates.is_featured,
                is_bestseller: updates.is_new,  // is_new yerine is_bestseller kullan
                rating: updates.rating,
                review_count: updates.review_count,
            })
            .eq("id", id)
            .select()
            .single();

        if (productError) {
            console.error("Product update error:", productError);
            throw new Error(`Product update failed: ${productError.message}`);
        }

        // 2. Varyantları güncelle
        if (variants && Array.isArray(variants)) {
            console.log("Updating variants, count:", variants.length);
            
            // Mevcut variant'ları sil
            const { error: deleteError } = await supabase
                .from("product_variants")
                .delete()
                .eq("product_id", id);

            if (deleteError) {
                console.error("Variants delete error:", deleteError);
                throw new Error(`Variants delete failed: ${deleteError.message}`);
            }

            // Yeni variant'ları ekle
            if (variants.length > 0) {
                const variantsToInsert = variants.map((v: any) => ({
                    product_id: id,
                    name: v.name,
                    weight: v.weight,
                    price: v.price,
                    original_price: v.original_price || null,
                    stock: v.stock,
                    sku: v.sku,
                }));

                console.log("Inserting variants:", variantsToInsert);

                const { error: variantsError } = await supabase
                    .from("product_variants")
                    .insert(variantsToInsert);

                if (variantsError) {
                    console.error("Variants insert error:", variantsError);
                    throw new Error(`Variants insert failed: ${variantsError.message}`);
                }
            }
        }

        // 3. Güncellenmiş ürünü variant'larla birlikte döndür
        const { data: fullProduct, error: fetchError } = await supabase
            .from("products")
            .select("*, variants:product_variants(*)")
            .eq("id", id)
            .single();

        if (fetchError) {
            console.error("Fetch updated product error:", fetchError);
        }

        return NextResponse.json({ success: true, product: fullProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to update product" },
            { status: 500 }
        );
    }
}

// DELETE /api/products - Delete a product
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        await deleteProduct(id);
        return NextResponse.json({ success: true, message: "Product deleted" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to delete product" },
            { status: 500 }
        );
    }
}
