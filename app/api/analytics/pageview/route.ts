import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// POST /api/analytics/pageview - Track page view
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, pageUrl, pageTitle } = body;

        if (!sessionId || !pageUrl) {
            return NextResponse.json({ success: false, error: "Session ID and page URL required" }, { status: 400 });
        }

        const supabase = createServerClient();

        // Insert page view
        await supabase.from("page_views").insert({
            session_id: sessionId,
            page_url: pageUrl,
            page_title: pageTitle,
            created_at: new Date().toISOString(),
        });

        // Increment session page views and update activity
        await supabase.rpc("increment_page_views", { p_session_id: sessionId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Page view tracking error:", error);
        // Don't fail the page load if tracking fails
        return NextResponse.json({ success: true });
    }
}
