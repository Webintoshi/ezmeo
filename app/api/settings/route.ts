import { NextRequest, NextResponse } from "next/server";
import {
    getSetting,
    getAllSettings,
    setSetting,
    deleteSetting,
    getPaymentMethods,
    setPaymentMethods,
    getShippingOptions,
    setShippingOptions,
    getStoreInfo,
    setStoreInfo,
    getAnnouncementBarSettings,
    setAnnouncementBarSettings,
    getMarqueeSettings,
    setMarqueeSettings,
    getAIProviderSettings,
    setAIProviderSettings,
    SETTING_KEYS
} from "@/lib/db/settings";
import { testAIConnection } from "@/lib/ai";

// GET /api/settings - Get settings
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");
        const type = searchParams.get("type");

        // Get specific setting types
        if (type === "payment") {
            const methods = await getPaymentMethods();
            return NextResponse.json({ success: true, paymentMethods: methods });
        }

        if (type === "shipping") {
            const options = await getShippingOptions();
            return NextResponse.json({ success: true, shippingOptions: options });
        }

        if (type === "store") {
            const info = await getStoreInfo();
            return NextResponse.json({ success: true, storeInfo: info });
        }

        if (type === "announcement") {
            const settings = await getAnnouncementBarSettings();
            return NextResponse.json({ success: true, announcementSettings: settings });
        }

        if (type === "marquee") {
            const settings = await getMarqueeSettings();
            return NextResponse.json({ success: true, marqueeSettings: settings });
        }

        if (type === "ai") {
            const aiSettings = await getAIProviderSettings();
            const hasEnvKey = !!process.env.GEMINI_API_KEY;
            return NextResponse.json({
                success: true,
                aiSettings: aiSettings ? {
                    provider: aiSettings.provider,
                    apiKey: aiSettings.apiKey,
                    model: aiSettings.model,
                } : null,
                hasEnvKey,
            });
        }

        // Get specific setting by key
        if (key) {
            const value = await getSetting(key);
            return NextResponse.json({ success: true, setting: { key, value } });
        }

        // Get all settings
        const settings = await getAllSettings();
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

// POST /api/settings - Create or update settings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, key, value, paymentMethods, shippingOptions, storeInfo, announcementSettings, marqueeSettings } = body;

        // Set specific setting types
        if (type === "payment" && paymentMethods) {
            await setPaymentMethods(paymentMethods);
            return NextResponse.json({ success: true, message: "Payment methods updated" });
        }

        if (type === "shipping" && shippingOptions) {
            await setShippingOptions(shippingOptions);
            return NextResponse.json({ success: true, message: "Shipping options updated" });
        }

        if (type === "store" && storeInfo) {
            await setStoreInfo(storeInfo);
            return NextResponse.json({ success: true, message: "Store info updated" });
        }

        if (type === "announcement" && announcementSettings) {
            await setAnnouncementBarSettings(announcementSettings);
            return NextResponse.json({ success: true, message: "Announcement bar updated" });
        }

        if (type === "marquee" && marqueeSettings) {
            await setMarqueeSettings(marqueeSettings);
            return NextResponse.json({ success: true, message: "Marquee settings updated" });
        }

        // AI provider settings — save
        if (type === "ai" && body.aiSettings) {
            await setAIProviderSettings(body.aiSettings);
            return NextResponse.json({ success: true, message: "AI provider settings updated" });
        }

        // AI provider settings — test connection
        if (type === "ai-test" && body.aiSettings) {
            const testResult = await testAIConnection(body.aiSettings);
            return NextResponse.json({ success: true, testResult });
        }

        // Set generic setting by key
        if (key && value) {
            const setting = await setSetting(key, value);
            return NextResponse.json({ success: true, setting });
        }

        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to update settings" },
            { status: 500 }
        );
    }
}

// DELETE /api/settings - Delete a setting
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");

        if (!key) {
            return NextResponse.json(
                { success: false, error: "Setting key is required" },
                { status: 400 }
            );
        }

        await deleteSetting(key);
        return NextResponse.json({ success: true, message: "Setting deleted" });
    } catch (error) {
        console.error("Error deleting setting:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to delete setting" },
            { status: 500 }
        );
    }
}
