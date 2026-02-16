"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('ezmeo_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem('ezmeo_session_id', sessionId);
    }
    return sessionId;
}

function getDeviceType(): string {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) {
        return 'mobile';
    }
    if (/ipad|tablet|playbook|silk/.test(ua)) {
        return 'tablet';
    }
    return 'desktop';
}

export function AnalyticsTracker() {
    const pathname = usePathname();
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        const newSessionId = getOrCreateSessionId();
        setSessionId(newSessionId);
    }, []);

    useEffect(() => {
        if (!sessionId || !pathname) return;

        const trackPageView = async () => {
            try {
                await fetch('/api/analytics/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        path: pathname,
                        deviceType: getDeviceType(),
                        userAgent: navigator.userAgent,
                    }),
                });

                await fetch('/api/analytics/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        sessionId,
                        path: pathname 
                    }),
                });
            } catch (error) {
                console.error("Analytics error:", error);
            }
        };

        trackPageView();

        const interval = setInterval(() => {
            fetch('/api/analytics/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, path: pathname }),
            }).catch(() => {});
        }, 15000);

        return () => clearInterval(interval);
    }, [pathname, sessionId]);

    return null;
}
