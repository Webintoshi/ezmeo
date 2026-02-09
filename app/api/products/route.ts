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
        const featured = searchParams.get("featured");
        const bestseller = searchParams.get("bestseller");
        const category = searchParams.get("category");
        const slug = searchParams.get("slug");
        const search = searchParams.get("search");

        let products;

        if (slug) {
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

        const product = await createProduct({
            name: body.name,
            slug: body.slug,
            description: body.description || null,
            short_description: body.shortDescription || null,
            images: body.images || [],
            category: body.category || null,
            tags: body.tags || [],
            is_featured: body.isFeatured || false,
            is_bestseller: body.isBestseller || false,
            seo_title: body.seoTitle || null,
            seo_description: body.seoDescription || null,
        });

        return NextResponse.json({ success: true, product });
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
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        const product = await updateProduct(id, updates);
        return NextResponse.json({ success: true, product });
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
