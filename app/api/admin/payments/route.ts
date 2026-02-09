import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    try {
        const supabase = createServerClient();

        // Security Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: "Yetkisiz erişim. Oturum açmalısınız." },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Geçersiz oturum." },
                { status: 401 }
            );
        }

        // Fetch settings
        const { data, error } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "payment_gateways")
            .single();

        if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
            throw error;
        }

        // Return empty array if no settings found
        const gateways = data?.value || [];

        return NextResponse.json({ success: true, gateways });

    } catch (error: unknown) {
        console.error("Get Payments Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createServerClient();

        // Security Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: "Yetkisiz erişim. Oturum açmalısınız." },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Geçersiz oturum." },
                { status: 401 }
            );
        }

        // Check Permissions (optional: only super_admin or specific roles)
        // For now, any authenticated admin is fine, or we can check profiles table.

        const body = await req.json();
        const { gateways } = body;

        if (!Array.isArray(gateways)) {
            return NextResponse.json(
                { success: false, error: "Invalid data format." },
                { status: 400 }
            );
        }

        // Upsert settings
        const { error } = await supabase
            .from("settings")
            .upsert({
                key: "payment_gateways",
                value: gateways,
                updated_at: new Date().toISOString()
            }, { onConflict: "key" });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Ödeme ayarları kaydedildi." });

    } catch (error: unknown) {
        console.error("Save Payments Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
