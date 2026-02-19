import { NextRequest, NextResponse } from "next/server";

// GET /api/categories - Get all categories or single by slug
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const slug = searchParams.get("slug");

        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        if (id) {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("id", id)
                .single();
            
            if (error) throw error;
            return NextResponse.json({ success: true, category: data });
        } else if (slug) {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("slug", slug)
                .single();
            
            if (error) throw error;
            return NextResponse.json({ success: true, category: data });
        } else {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });
            
            if (error) throw error;
            return NextResponse.json({ success: true, categories: data || [] });
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

// PUT /api/categories - Update a category
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Category ID is required" },
                { status: 400 }
            );
        }

        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        // Build update object with only provided fields
        const updateData: any = {};
        
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.image !== undefined) updateData.image = updates.image;
        if (updates.icon !== undefined) updateData.icon = updates.icon;
        if (updates.sort_order !== undefined) updateData.sort_order = updates.sort_order;
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
        
        // SEO fields
        if (updates.seo_title !== undefined) updateData.seo_title = updates.seo_title;
        if (updates.seo_description !== undefined) updateData.seo_description = updates.seo_description;
        if (updates.seo_keywords !== undefined) updateData.seo_keywords = updates.seo_keywords;
        
        // FAQ and GEO fields (stored as JSONB)
        if (updates.faq !== undefined) updateData.faq = updates.faq;
        if (updates.geo_data !== undefined) updateData.geo_data = updates.geo_data;

        const { data, error } = await supabase
            .from("categories")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Category update error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, category: data });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to update category" },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        const { data, error } = await supabase
            .from("categories")
            .insert({
                name: body.name,
                slug: body.slug,
                description: body.description || null,
                image: body.image || null,
                icon: body.icon || '📦',
                sort_order: body.sort_order || 0,
                is_active: body.is_active !== false,
                seo_title: body.seo_title || null,
                seo_description: body.seo_description || null,
                seo_keywords: body.seo_keywords || [],
                faq: body.faq || [],
                geo_data: body.geo_data || { keyTakeaways: [], entities: [] }
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, category: data });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to create category" },
            { status: 500 }
        );
    }
}

// DELETE /api/categories - Delete a category
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Category ID is required" },
                { status: 400 }
            );
        }

        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Category deleted" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to delete category" },
            { status: 500 }
        );
    }
}
