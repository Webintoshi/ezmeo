import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Public endpoint to get active payment gateways for checkout
// No authentication required - only returns non-sensitive data
export async function GET() {
    try {
        const supabase = createServerClient();

        // Fetch payment gateways from settings
        const { data, error } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "payment_gateways")
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        const allGateways = data?.value || [];

        // Filter to only active gateways and sanitize sensitive data
        const activeGateways = allGateways
            .filter((g: { status: string }) => g.status === "active")
            .map((gateway: {
                id: string;
                gateway: string;
                name: string;
                description?: string;
                icon?: string;
                bankAccount?: {
                    bankName?: string;
                    iban?: string;
                    accountHolder?: string;
                };
            }) => ({
                id: gateway.id,
                gateway: gateway.gateway,
                name: gateway.name,
                description: gateway.description || "",
                icon: gateway.icon || "",
                // Include bank account info for bank_transfer (needed for display)
                ...(gateway.gateway === "bank_transfer" && gateway.bankAccount ? {
                    bankAccount: {
                        bankName: gateway.bankAccount.bankName,
                        iban: gateway.bankAccount.iban,
                        accountHolder: gateway.bankAccount.accountHolder
                    }
                } : {})
            }));

        return NextResponse.json({ success: true, gateways: activeGateways });

    } catch (error: unknown) {
        console.error("Public Payments Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, error: errorMessage, gateways: [] }, { status: 500 });
    }
}
