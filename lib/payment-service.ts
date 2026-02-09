import { PaymentGatewayConfig } from "@/types/payment";
import { supabase } from "@/lib/supabase";

const API_URL = "/api/admin/payments";

async function getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
}

export const PaymentService = {
    async getAll(): Promise<PaymentGatewayConfig[]> {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(API_URL, { headers });

            if (!res.ok) throw new Error("Failed to fetch payment gateways");

            const data = await res.json();
            return data.gateways || [];
        } catch (error) {
            console.error("PaymentService.getAll error:", error);
            return []; // Fallback to empty array
        }
    },

    async saveAll(gateways: PaymentGatewayConfig[]): Promise<boolean> {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(API_URL, {
                method: "POST",
                headers,
                body: JSON.stringify({ gateways })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save settings");
            }

            return true;
        } catch (error) {
            console.error("PaymentService.saveAll error:", error);
            throw error;
        }
    }
};
