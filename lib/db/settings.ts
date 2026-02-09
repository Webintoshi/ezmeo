import { createServerClient, Setting } from "@/lib/supabase";

// =====================================================
// SETTINGS OPERATIONS
// =====================================================

/**
 * Get setting by key
 */
export async function getSetting(key: string): Promise<Record<string, unknown> | null> {
    const serverClient = createServerClient();

    const { data, error } = await serverClient
        .from("settings")
        .select("value")
        .eq("key", key)
        .single();

    if (error) return null;
    return data?.value || null;
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, Record<string, unknown>>> {
    const serverClient = createServerClient();

    const { data, error } = await serverClient
        .from("settings")
        .select("key, value");

    if (error) throw error;

    const settings: Record<string, Record<string, unknown>> = {};
    for (const item of data || []) {
        settings[item.key] = item.value;
    }
    return settings;
}

/**
 * Set setting (upsert)
 */
export async function setSetting(key: string, value: Record<string, unknown>) {
    const serverClient = createServerClient();

    const { data, error } = await serverClient
        .from("settings")
        .upsert({ key, value }, { onConflict: "key" })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete setting
 */
export async function deleteSetting(key: string) {
    const serverClient = createServerClient();

    const { error } = await serverClient
        .from("settings")
        .delete()
        .eq("key", key);

    if (error) throw error;
    return true;
}

// =====================================================
// PREDEFINED SETTING KEYS
// =====================================================

export const SETTING_KEYS = {
    PAYMENT_METHODS: "payment_methods",
    SHIPPING_OPTIONS: "shipping_options",
    STORE_INFO: "store_info",
    SEO_SETTINGS: "seo_settings",
    EMAIL_SETTINGS: "email_settings",
    NOTIFICATION_SETTINGS: "notification_settings",
} as const;

// =====================================================
// TYPED SETTING HELPERS
// =====================================================

export interface PaymentMethod {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    instructions?: string;
}

export interface ShippingOption {
    id: string;
    name: string;
    price: number;
    minOrder?: number;
    estimatedDays: string;
    enabled: boolean;
}

export interface StoreInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    taxRate: number;
}

/**
 * Get payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    const data = await getSetting(SETTING_KEYS.PAYMENT_METHODS);
    return (data?.methods as PaymentMethod[]) || [];
}

/**
 * Set payment methods
 */
export async function setPaymentMethods(methods: PaymentMethod[]) {
    return setSetting(SETTING_KEYS.PAYMENT_METHODS, { methods });
}

/**
 * Get shipping options
 */
export async function getShippingOptions(): Promise<ShippingOption[]> {
    const data = await getSetting(SETTING_KEYS.SHIPPING_OPTIONS);
    return (data?.options as ShippingOption[]) || [];
}

/**
 * Set shipping options
 */
export async function setShippingOptions(options: ShippingOption[]) {
    return setSetting(SETTING_KEYS.SHIPPING_OPTIONS, { options });
}

/**
 * Get store info
 */
export async function getStoreInfo(): Promise<StoreInfo | null> {
    const data = await getSetting(SETTING_KEYS.STORE_INFO);
    return data as StoreInfo | null;
}

/**
 * Set store info
 */
export async function setStoreInfo(info: StoreInfo) {
    return setSetting(SETTING_KEYS.STORE_INFO, info as unknown as Record<string, unknown>);
}
