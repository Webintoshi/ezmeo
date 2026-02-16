import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const BOT_USER_AGENTS = [
    'bot', 'spider', 'crawler', 'googlebot', 'bingbot', 'yandex', 'duckduckbot',
    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'slackbot', 'telegrambot',
    'applebot', 'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'rogerbot', 'screaming frog'
];

function isBot(userAgent: string | undefined): boolean {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

export async function GET() {
    try {
        const supabase = createServerClient();
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { data: activeSessions, count: activeCount } = await supabase
            .from("sessions")
            .select("*", { count: "exact" })
            .gte("last_activity_at", fiveMinutesAgo)
            .eq("is_active", true);

        const humanSessions = activeSessions?.filter(s => !isBot(s.user_agent)) || [];
        const humanCount = humanSessions.length;

        const mobileCount = humanSessions.filter(s => s.device_type === "mobile").length || 0;
        const desktopCount = humanSessions.filter(s => s.device_type === "desktop").length || 0;
        const tabletCount = humanSessions.filter(s => s.device_type === "tablet").length || 0;

        const { data: recentPageViews } = await supabase
            .from("page_views")
            .select("page_url, session_id")
            .gte("created_at", fiveMinutesAgo)
            .order("created_at", { ascending: false })
            .limit(100);

        const humanSessionIds = new Set(humanSessions.map(s => s.session_id));
        const humanPageViews = recentPageViews?.filter(pv => humanSessionIds.has(pv.session_id)) || [];

        const pageGroups: Record<string, number> = {};
        humanPageViews.forEach(pv => {
            pageGroups[pv.page_url] = (pageGroups[pv.page_url] || 0) + 1;
        });

        const topPages = Object.entries(pageGroups)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([url, count]) => ({ url, count }));

        return NextResponse.json({
            success: true,
            data: {
                liveVisitors: humanCount,
                devices: {
                    mobile: mobileCount,
                    desktop: desktopCount,
                    tablet: tabletCount,
                },
                topPages,
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
