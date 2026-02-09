import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// POST /api/analytics/heartbeat - Keep session alive
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 });
        }

        const supabase = createServerClient();

        // Update session last activity
        await supabase
            .from("sessions")
            .update({
                last_activity_at: new Date().toISOString(),
                is_active: true
            })
            .eq("session_id", sessionId);

        // Get active visitor count
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { count } = await supabase
            .from("sessions")
            .select("*", { count: "exact", head: true })
            .gte("last_activity_at", fiveMinutesAgo);

        return NextResponse.json({
            success: true,
            visitors: count || 0,
        });
    } catch (error) {
        console.error("Heartbeat error:", error);
        return NextResponse.json({ success: true, visitors: 0 });
    }
}

// GET /api/analytics/heartbeat - Get active visitor count
export async function GET() {
    try {
        const supabase = createServerClient();

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { count } = await supabase
            .from("sessions")
            .select("*", { count: "exact", head: true })
            .gte("last_activity_at", fiveMinutesAgo);

        return NextResponse.json({
            success: true,
            visitors: count || 0,
        });
    } catch (error) {
        console.error("Heartbeat GET error:", error);
        return NextResponse.json({ success: true, visitors: 0 });
    }
}
