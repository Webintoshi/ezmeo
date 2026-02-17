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
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        let products;

        if (id) {
            // Fetch single product by ID from Supabase
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
            // Fetch single product by slug from Supabase
            const { createServerClient } = await import("@/lib/supabase");
            const supabase = createServerClient();
            const { data, error } = await supabase
                .from("products")
                .select("*, variants:product_variants(*)")
                .eq("slug", slug)
                .single();
            if (error) {
                return NextResponse.json({ 
                    success: false, 
                    error: error.message 
                }, { status: 404 });
            }
            return NextResponse.json({ success: true, product: data });
        } else if (featured === "true") {
            const { createServerClient } = await import("@/lib/supabase");
            const supabase = createServerClient();
            const { data, error } = await supabase
                .from("products")
                .select("*, variants:product_variants(*)")
                .eq("is_featured", true)
                .limit(10);
            if (error) throw error;
            products = data || [];
        } else if (bestseller === "true") {
            const { createServerClient } = await import("@/lib/supabase");
            const supabase = createServerClient();
            const { data, error } = await supabase
                .from("products")
                .select("*, variants:product_variants(*)")
                .eq("is_bestseller", true)
                .limit(10);
            if (error) throw error;
            products = data || [];
        } else if (category) {
            // Fetch products by category from Supabase with pagination
            const { createServerClient } = await import("@/lib/supabase");
            const supabase = createServerClient();

            // Get total count
            const { count } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .eq("category", category);

            // Get paginated data
            const { data, error } = await supabase
                .from("products")
                .select("*, variants:product_variants(*)")
                .eq("category", category)
                .range(offset, offset + limit - 1)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return NextResponse.json({
                success: true,
                products: data || [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            });
        } else if (search) {
            const { createServerClient } = await import("@/lib/supabase");
            const supabase = createServerClient();
            const { data, error } = await supabase
                .from("products")
                .select("*, variants:product_variants(*)")
                .or(`name.ilike.%${search}%,description.ilike.%${search}%`)
                .limit(20);
            if (error) throw error;
            products = data || [];
        } else {
            // Fetch all products from Supabase with pagination
            const { createServerClient } = await import("@/lib/supabase");
            const supabase = createServerClient();

            // Get total count
            const { count } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true });

            // Get paginated data
            const { data, error } = await supabase
                .from("products")
                .select("*, variants:product_variants(*)")
                .range(offset, offset + limit - 1)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return NextResponse.json({
                success: true,
                products: data || [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            });
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
        const { variants, discount_rules, ...productData } = body;

        console.log('POST /api/products - productData.images:', productData.images);
        console.log('POST /api/products - body images count:', body.images?.length);

        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        // Validation: Zorunlu alanlar
        const validationErrors: string[] = [];
        if (!productData.name || productData.name.trim() === '') {
            validationErrors.push("Ürün adı gereklidir");
        }
        if (!productData.slug || productData.slug.trim() === '') {
            validationErrors.push("URL slug gereklidir");
        }
        if (!productData.description || productData.description.trim() === '') {
            validationErrors.push("Ürün açıklaması gereklidir");
        }
        if (!productData.short_description || productData.short_description.trim() === '') {
            validationErrors.push("Kısa açıklama gereklidir");
        }
        if (!productData.category) {
            validationErrors.push("Kategori seçilmelidir");
        }
        
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: validationErrors.join(", "), code: "VALIDATION_ERROR" },
                { status: 400 }
            );
        }

        // 1. Slug benzersizlik kontrolü
        if (productData.slug) {
            const { data: existingProduct } = await supabase
                .from("products")
                .select("id")
                .eq("slug", productData.slug)
                .single();

            if (existingProduct) {
                const uniqueSlug = `${productData.slug}-${Date.now().toString(36)}`;
                productData.slug = uniqueSlug;
                console.log("Slug changed to:", uniqueSlug);
            }
        }

        // 2. Görselleri normalize et - images_v2 formatını düzelt (camelCase -> snake_case)
        let normalizedImagesV2 = productData.images_v2 || [];
        if (normalizedImagesV2.length > 0) {
            normalizedImagesV2 = normalizedImagesV2.map((img: any, idx: number) => ({
                url: img.url,
                alt: img.alt || "",
                is_primary: img.isPrimary !== undefined ? img.isPrimary : (idx === 0),
                sort_order: img.sortOrder !== undefined ? img.sortOrder : idx,
            }));
        }

        // images array'ini de güncelle (geriye uyumluluk için)
        const normalizedImages = productData.images || normalizedImagesV2.map((img: any) => img.url);

        // 3. Ana ürünü oluştur
        const { data: product, error: productError } = await supabase
            .from("products")
            .insert({
                name: productData.name,
                slug: productData.slug,
                description: productData.description || null,
                short_description: productData.short_description || null,
                images: normalizedImages,
                images_v2: normalizedImagesV2,
                category: productData.category || null,
                subcategory: productData.subcategory || null,
                tags: productData.tags || [],
                is_active: productData.is_active !== false,
                is_featured: productData.is_featured || false,
                is_bestseller: productData.is_bestseller || false,
                is_new: productData.is_new || false,
                vegan: productData.vegan || false,
                gluten_free: productData.gluten_free || false,
                sugar_free: productData.sugar_free || false,
                high_protein: productData.high_protein || false,
                rating: productData.rating || 5,
                review_count: productData.review_count || 0,
                status: productData.status || 'published',
                is_draft: productData.is_draft || false,
                published_at: productData.published_at || new Date().toISOString(),
                tax_rate: productData.tax_rate || 10,
                brand: productData.brand || 'Ezmeo',
                country_of_origin: productData.country_of_origin || 'Türkiye',
                sku: productData.sku || null,
                gtin: productData.gtin || null,
                dimensions: productData.dimensions || {},
                related_products: productData.related_products || [],
                complementary_products: productData.complementary_products || [],
                seo_title: productData.seo_title || null,
                seo_description: productData.seo_description || null,
                seo_keywords: productData.seo_keywords || [],
                seo_focus_keyword: productData.seo_focus_keyword || null,
                og_image: productData.og_image || null,
                canonical_url: productData.canonical_url || null,
                seo_robots: productData.seo_robots || 'index,follow',
                track_stock: productData.track_stock !== false,
                low_stock_threshold: productData.low_stock_threshold || 10,
                nutrition_basis: productData.nutrition_basis || 'per_100g',
                serving_size: productData.serving_size || 100,
                serving_per_container: productData.serving_per_container || 1,
                allergens: productData.allergens || [],
                vitamins: productData.vitamins || {},
                ingredients: productData.ingredients || null,
                storage_conditions: productData.storage_conditions || null,
                shelf_life_days: productData.shelf_life_days || null,
                calories: productData.calories || 0,
                protein: productData.protein || 0,
                carbs: productData.carbs || 0,
                fat: productData.fat || 0,
                fiber: productData.fiber || 0,
                sugar: productData.sugar || 0,
                saturated_fat: productData.saturated_fat || 0,
                sodium: productData.sodium || 0,
            })
            .select()
            .single();

        if (productError) {
            console.error("Product insert error:", productError);
            throw productError;
        }

        console.log("Product created with ID:", product.id);
        
        // 4. Varyantları ekle (benzersiz SKU oluştur)
        if (variants && Array.isArray(variants) && variants.length > 0) {
            console.log("Processing variants, count:", variants.length);
            console.log("Variants data:", JSON.stringify(variants, null, 2));
            
            const variantsToInsert = variants.map((v: any, idx: number) => ({
                product_id: product.id,
                name: v.name,
                weight: String(v.weight || 0),
                price: v.price || 0,
                original_price: v.original_price || null,
                cost: v.cost || null,
                stock: v.stock || 0,
                sku: v.sku || `EZM-${Date.now().toString(36)}-${idx}`,
                barcode: v.barcode || null,
                group_name: v.group_name || null,
                unit: v.unit || 'adet',
                max_purchase_quantity: v.max_purchase_quantity || null,
                warehouse_location: v.warehouse_location || null,
                images: v.images || [],
            }));

            console.log("Inserting variants:", JSON.stringify(variantsToInsert, null, 2));

            const { error: variantsError } = await supabase
                .from("product_variants")
                .insert(variantsToInsert);

            if (variantsError) {
                console.error("Variants insert error:", variantsError);
                throw variantsError;
            }
            console.log("Variants inserted successfully");
        } else {
            console.log("No variants to insert");
        }

        // 5. İndirim kurallarını product_discount_rules tablosuna kaydet
        if (discount_rules && Array.isArray(discount_rules) && discount_rules.length > 0) {
            console.log("Processing discount rules, count:", discount_rules.length);
            
            const discountRulesToInsert = discount_rules.map((rule: any) => ({
                product_id: product.id,
                name: rule.name,
                type: rule.type,
                config: rule.config || {},
                is_active: rule.isActive !== false,
                priority: 0,
            }));

            const { error: discountError } = await supabase
                .from("product_discount_rules")
                .insert(discountRulesToInsert);

            if (discountError) {
                console.error("Discount rules insert error:", discountError);
            } else {
                console.log("Discount rules inserted successfully");
            }
        }

        // 6. Tam ürünü döndür
        const { data: fullProduct } = await supabase
            .from("products")
            .select("*, variants:product_variants(*)")
            .eq("id", product.id)
            .single();

        return NextResponse.json({ success: true, product: fullProduct });
    } catch (error: any) {
        console.error("Error creating product:", error);
        console.error("Error details:", error?.details, error?.message, error?.code);
        return NextResponse.json(
            { success: false, error: error?.message || error?.details || "Failed to create product", code: error?.code },
            { status: 500 }
        );
    }
}

// PUT /api/products - Update a product
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, variants, discount_rules, deleted_images, ...updates } = body;

        console.log("PUT /api/products - ID:", id);
        console.log("PUT /api/products - Updates:", updates);
        console.log("PUT /api/products - Variants:", variants);
        console.log("PUT /api/products - Discount rules:", discount_rules);
        console.log("PUT /api/products - Deleted images:", deleted_images);

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        // 1. Slug benzersizlik kontrolü (güncelleme sırasında)
        if (updates.slug) {
            const { data: existingProduct } = await supabase
                .from("products")
                .select("id")
                .eq("slug", updates.slug)
                .neq("id", id)
                .single();

            if (existingProduct) {
                updates.slug = `${updates.slug}-${Date.now().toString(36)}`;
                console.log("Slug changed to:", updates.slug);
            }
        }

        // 2. Mevcut ürünü al (görselleri filtrelemek için)
        const { data: existingProduct } = await supabase
            .from("products")
            .select("images")
            .eq("id", id)
            .single();

        // 3. Silinen görselleri R2'den de sil
        if (deleted_images && Array.isArray(deleted_images)) {
            const { deleteFromR2 } = await import("@/lib/r2");
            for (const key of deleted_images) {
                await deleteFromR2(key);
            }
        }

        // 4. Görselleri normalize et - images_v2 formatını düzelt
        let normalizedImagesV2 = updates.images_v2 || [];
        if (normalizedImagesV2.length > 0) {
            normalizedImagesV2 = normalizedImagesV2.map((img: any, idx: number) => ({
                url: img.url,
                alt: img.alt || "",
                is_primary: img.isPrimary !== undefined ? img.isPrimary : (idx === 0),
                sort_order: img.sortOrder !== undefined ? img.sortOrder : idx,
            }));
        }

        let finalImages = updates.images || normalizedImagesV2.map((img: any) => img.url);

        if (deleted_images && Array.isArray(deleted_images) && existingProduct?.images) {
            finalImages = finalImages.filter((img: string) => !deleted_images.includes(img));
        }

        // 5. Ana ürünü güncelle
        const { data: product, error: productError } = await supabase
            .from("products")
            .update({
                name: updates.name,
                slug: updates.slug,
                description: updates.description,
                short_description: updates.short_description,
                images: finalImages,
                images_v2: normalizedImagesV2,
                category: updates.category,
                subcategory: updates.subcategory,
                tags: updates.tags,
                is_active: updates.is_active !== false,
                is_featured: updates.is_featured || false,
                is_bestseller: updates.is_bestseller || false,
                is_new: updates.is_new || false,
                vegan: updates.vegan || false,
                gluten_free: updates.gluten_free || false,
                sugar_free: updates.sugar_free || false,
                high_protein: updates.high_protein || false,
                rating: updates.rating,
                review_count: updates.review_count,
                status: updates.status || 'published',
                is_draft: updates.is_draft || false,
                published_at: updates.published_at,
                tax_rate: updates.tax_rate || 10,
                brand: updates.brand || 'Ezmeo',
                country_of_origin: updates.country_of_origin || 'Türkiye',
                sku: updates.sku || null,
                gtin: updates.gtin || null,
                dimensions: updates.dimensions || {},
                related_products: updates.related_products || [],
                complementary_products: updates.complementary_products || [],
                seo_title: updates.seo_title || null,
                seo_description: updates.seo_description || null,
                seo_keywords: updates.seo_keywords || [],
                seo_focus_keyword: updates.seo_focus_keyword || null,
                og_image: updates.og_image || null,
                canonical_url: updates.canonical_url || null,
                seo_robots: updates.seo_robots || 'index,follow',
                track_stock: updates.track_stock !== false,
                low_stock_threshold: updates.low_stock_threshold || 10,
                nutrition_basis: updates.nutrition_basis || 'per_100g',
                serving_size: updates.serving_size || 100,
                serving_per_container: updates.serving_per_container || 1,
                allergens: updates.allergens || [],
                vitamins: updates.vitamins || {},
                ingredients: updates.ingredients || null,
                storage_conditions: updates.storage_conditions || null,
                shelf_life_days: updates.shelf_life_days || null,
                calories: updates.calories || 0,
                protein: updates.protein || 0,
                carbs: updates.carbs || 0,
                fat: updates.fat || 0,
                fiber: updates.fiber || 0,
                sugar: updates.sugar || 0,
                saturated_fat: updates.saturated_fat || 0,
                sodium: updates.sodium || 0,
            })
            .eq("id", id)
            .select()
            .single();

        if (productError) {
            console.error("Product update error:", productError);
            throw new Error(`Product update failed: ${productError.message}`);
        }

        // 6. Varyantları güncelle
        if (variants && Array.isArray(variants)) {
            console.log("Updating variants, count:", variants.length);

            const { data: existingVariants } = await supabase
                .from("product_variants")
                .select("id, product_id")
                .eq("product_id", id);

            const { data: variantsWithOrders } = await supabase
                .from("order_items")
                .select("variant_id")
                .in("variant_id", existingVariants?.map(v => v.id) || [])
                .neq("variant_id", null);

            const orderedVariantIds = new Set(variantsWithOrders?.map(v => v.variant_id) || []);
            
            const variantsToDelete = existingVariants
                ?.filter(v => !orderedVariantIds.has(v.id))
                .map(v => v.id) || [];

            if (variantsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from("product_variants")
                    .delete()
                    .in("id", variantsToDelete);

                if (deleteError) {
                    console.error("Variants delete error:", deleteError);
                    throw new Error(`Variants delete failed: ${deleteError.message}`);
                }
            }

            const newVariants = variants.filter((v: any) => !v.id);
            const existingVariantsToUpdate = variants.filter((v: any) => v.id && !orderedVariantIds.has(v.id));

            for (const v of existingVariantsToUpdate) {
                const { error: updateError } = await supabase
                    .from("product_variants")
                    .update({
                        name: v.name,
                        weight: String(v.weight || 0),
                        price: v.price || 0,
                        original_price: v.original_price || null,
                        cost: v.cost || null,
                        stock: v.stock || 0,
                        sku: v.sku || `EZM-${Date.now().toString(36)}`,
                        barcode: v.barcode || null,
                        group_name: v.group_name || null,
                        unit: v.unit || 'adet',
                        max_purchase_quantity: v.max_purchase_quantity || null,
                        warehouse_location: v.warehouse_location || null,
                        images: v.images || [],
                    })
                    .eq("id", v.id);

                if (updateError) {
                    console.error("Variant update error:", updateError);
                }
            }

            if (newVariants.length > 0) {
                const variantsToInsert = newVariants.map((v: any, idx: number) => ({
                    product_id: id,
                    name: v.name,
                    weight: String(v.weight || 0),
                    price: v.price || 0,
                    original_price: v.original_price || null,
                    cost: v.cost || null,
                    stock: v.stock || 0,
                    sku: v.sku || `EZM-${Date.now().toString(36)}-${idx}`,
                    barcode: v.barcode || null,
                    group_name: v.group_name || null,
                    unit: v.unit || 'adet',
                    max_purchase_quantity: v.max_purchase_quantity || null,
                    warehouse_location: v.warehouse_location || null,
                    images: v.images || [],
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

        // 7. İndirim kurallarını güncelle
        if (discount_rules && Array.isArray(discount_rules)) {
            console.log("Updating discount rules, count:", discount_rules.length);
            
            // Mevcut indirim kurallarını sil
            const { error: deleteDiscountError } = await supabase
                .from("product_discount_rules")
                .delete()
                .eq("product_id", id);

            if (deleteDiscountError) {
                console.error("Delete discount rules error:", deleteDiscountError);
            }

            // Yeni indirim kurallarını ekle
            if (discount_rules.length > 0) {
                const discountRulesToInsert = discount_rules.map((rule: any) => ({
                    product_id: id,
                    name: rule.name,
                    type: rule.type,
                    config: rule.config || {},
                    is_active: rule.isActive !== false,
                    priority: 0,
                }));

                const { error: discountError } = await supabase
                    .from("product_discount_rules")
                    .insert(discountRulesToInsert);

                if (discountError) {
                    console.error("Discount rules insert error:", discountError);
                } else {
                    console.log("Discount rules updated successfully");
                }
            }
        }

        // 8. Güncellenmiş ürünü variant'larla birlikte döndür
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
