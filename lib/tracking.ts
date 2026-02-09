"use client";

// Generate unique session ID
function generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
}

// Get or create session ID from localStorage
function getSessionId(): string {
    if (typeof window === "undefined") return "";

    const storageKey = "ezmeo_session_id";
    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
}

// Get device type
function getDeviceType(): string {
    if (typeof window === "undefined") return "unknown";

    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
        if (/ipad|tablet/i.test(userAgent)) return "tablet";
        return "mobile";
    }
    return "desktop";
}

// Get browser name
function getBrowser(): string {
    if (typeof window === "undefined") return "unknown";

    const userAgent = navigator.userAgent;

    if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) return "Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";

    return "Other";
}

// Get OS
function getOS(): string {
    if (typeof window === "undefined") return "unknown";

    const userAgent = navigator.userAgent;

    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";

    return "Other";
}

// Get UTM parameters
function getUTMParams() {
    if (typeof window === "undefined") return {};

    const params = new URLSearchParams(window.location.search);

    return {
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
    };
}

// Tracking class
class Tracker {
    private sessionId: string = "";
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private isInitialized: boolean = false;

    async init() {
        if (typeof window === "undefined" || this.isInitialized) return;

        this.sessionId = getSessionId();
        this.isInitialized = true;

        // Create or update session
        await this.createSession();

        // Start heartbeat to keep session active
        this.startHeartbeat();

        // Track initial page view
        await this.trackPageView();

        // Track page views on route change
        if (typeof window !== "undefined") {
            window.addEventListener("popstate", () => this.trackPageView());
        }
    }

    private async createSession() {
        try {
            const utmParams = getUTMParams();

            await fetch("/api/analytics/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    userAgent: navigator.userAgent,
                    referrer: document.referrer || undefined,
                    deviceType: getDeviceType(),
                    browser: getBrowser(),
                    os: getOS(),
                    ...utmParams,
                }),
            });
        } catch (error) {
            console.error("Failed to create session:", error);
        }
    }

    private startHeartbeat() {
        // Send heartbeat every 30 seconds
        this.heartbeatInterval = setInterval(async () => {
            try {
                await fetch("/api/analytics/heartbeat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: this.sessionId }),
                });
            } catch (error) {
                console.error("Heartbeat failed:", error);
            }
        }, 30000);
    }

    async trackPageView(customUrl?: string, customTitle?: string) {
        if (!this.sessionId) return;

        try {
            await fetch("/api/analytics/pageview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    pageUrl: customUrl || window.location.pathname,
                    pageTitle: customTitle || document.title,
                }),
            });
        } catch (error) {
            console.error("Failed to track page view:", error);
        }
    }

    async trackEvent(eventType: string, eventData?: Record<string, unknown>) {
        if (!this.sessionId) return;

        try {
            await fetch("/api/analytics/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    eventType,
                    eventData,
                    pageUrl: window.location.pathname,
                }),
            });
        } catch (error) {
            console.error("Failed to track event:", error);
        }
    }

    async trackCheckout(step: string, cartItems: unknown[], cartTotal: number, email?: string, phone?: string) {
        if (!this.sessionId) return;

        try {
            await fetch("/api/analytics/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    step,
                    cartItems,
                    cartTotal,
                    email,
                    phone,
                }),
            });
        } catch (error) {
            console.error("Failed to track checkout:", error);
        }
    }

    destroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
}

// Singleton instance
let trackerInstance: Tracker | null = null;

export function getTracker(): Tracker {
    if (!trackerInstance) {
        trackerInstance = new Tracker();
    }
    return trackerInstance;
}

// Convenience functions
export const initTracking = () => getTracker().init();
export const trackPageView = (url?: string, title?: string) => getTracker().trackPageView(url, title);
export const trackEvent = (type: string, data?: Record<string, unknown>) => getTracker().trackEvent(type, data);
export const trackCheckout = (step: string, items: unknown[], total: number, email?: string, phone?: string) =>
    getTracker().trackCheckout(step, items, total, email, phone);

// Common event types
export const EVENTS = {
    ADD_TO_CART: "add_to_cart",
    REMOVE_FROM_CART: "remove_from_cart",
    VIEW_PRODUCT: "view_product",
    SEARCH: "search",
    CHECKOUT_START: "checkout_start",
    CHECKOUT_STEP: "checkout_step",
    PURCHASE: "purchase",
    CLICK: "click",
    SCROLL: "scroll",
};
