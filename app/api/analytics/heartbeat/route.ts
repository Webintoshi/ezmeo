import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// POST /api/analytics/heartbeat - Keep session alive
export async function POST(request: NextRequest) {
    try {
        let body: { sessionId?: string } = {};
        
        // Safely parse JSON body
        try {
            body = await request.json();
        } catch {
            // Invalid JSON body
            return NextResponse.json({ success: true, visitors: 0 });
        }
        
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ success: true, visitors: 0 });
        }

        const supabase = createServerClient();

        // Update session last activity - ignore errors
        try {
            await supabase
                .from("sessions")
                .update({
                    last_activity_at: new Date().toISOString(),
                    is_active: true
                })
                .eq("session_id", sessionId);
        } catch {
            // Ignore update errors
        }

        // Get active visitor count - ignore errors
        let visitors = 0;
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { count } = await supabase
                .from("sessions")
                .select("*", { count: "exact", head: true })
                .gte("last_activity_at", fiveMinutesAgo);
            visitors = count || 0;
        } catch {
            visitors = 0;
        }

        return NextResponse.json({
            success: true,
            visitors,
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

        let visitors = 0;
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { count } = await supabase
                .from("sessions")
                .select("*", { count: "exact", head: true })
                .gte("last_activity_at", fiveMinutesAgo);
            visitors = count || 0;
        } catch {
            visitors = 0;
        }

        return NextResponse.json({
            success: true,
            visitors,
        });
    } catch (error) {
        console.error("Heartbeat GET error:", error);
        return NextResponse.json({ success: true, visitors: 0 });
    }
}
