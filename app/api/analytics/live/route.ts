import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/analytics/live - Get live analytics data
export async function GET() {
    try {
        const supabase = createServerClient();
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Active sessions (last 5 minutes)
        const { data: activeSessions, count: activeCount } = await supabase
            .from("sessions")
            .select("*", { count: "exact" })
            .gte("last_activity_at", fiveMinutesAgo);

        // Device breakdown
        const mobileCount = activeSessions?.filter(s => s.device_type === "mobile").length || 0;
        const desktopCount = activeSessions?.filter(s => s.device_type === "desktop").length || 0;
        const tabletCount = activeSessions?.filter(s => s.device_type === "tablet").length || 0;

        // Current pages
        const { data: recentPageViews } = await supabase
            .from("page_views")
            .select("page_url, session_id")
            .gte("created_at", fiveMinutesAgo)
            .order("created_at", { ascending: false })
            .limit(100);

        // Group by page
        const pageGroups: Record<string, number> = {};
        recentPageViews?.forEach(pv => {
            pageGroups[pv.page_url] = (pageGroups[pv.page_url] || 0) + 1;
        });
        const topPages = Object.entries(pageGroups)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([url, count]) => ({ url, count }));

        // Recent events
        const { data: recentEvents } = await supabase
            .from("events")
            .select("*")
            .gte("created_at", thirtyMinutesAgo)
            .order("created_at", { ascending: false })
            .limit(20);

        // Abandoned carts (last 24 hours) - from abandoned_carts table
        const { data: abandonedCarts, count: abandonedCount } = await supabase
            .from("abandoned_carts")
            .select("*", { count: "exact" })
            .eq("status", "active")
            .gte("created_at", oneDayAgo);

        const abandonedTotal = abandonedCarts?.reduce((sum, c) => sum + Number(c.total || 0), 0) || 0;

        // Today's stats - from events table
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Get add_to_cart and purchase events from last 24 hours
        const { data: todayEvents } = await supabase
            .from("events")
            .select("event_type")
            .gte("created_at", oneDayAgo);

        const addToCartCount = todayEvents?.filter(e => e.event_type === "add_to_cart").length || 0;
        const purchaseCount = todayEvents?.filter(e => e.event_type === "purchase").length || 0;

        return NextResponse.json({
            success: true,
            data: {
                liveVisitors: activeCount || 0,
                devices: {
                    mobile: mobileCount,
                    desktop: desktopCount,
                    tablet: tabletCount,
                },
                topPages,
                recentEvents: recentEvents?.map(e => ({
                    type: e.event_type,
                    data: e.event_data,
                    pageUrl: e.page_url,
                    createdAt: e.created_at,
                })),
                abandonedCarts: {
                    count: abandonedCount || 0,
                    total: abandonedTotal,
                },
                today: {
                    addToCart: addToCartCount,
                    purchases: purchaseCount,
                },
            },
        });
    } catch (error) {
        console.error("Live analytics error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch live data" },
            { status: 500 }
        );
    }
}
