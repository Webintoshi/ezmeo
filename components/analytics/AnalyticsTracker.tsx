"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const ping = async () => {
            try {
                await fetch('/api/analytics/heartbeat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: pathname }),
                });
            } catch (error) {
                // Create a silent failure, don't annoy user if analytics fails
                console.error("Analytics ping failed", error);
            }
        };

        // Initial ping
        ping();

        // Ping every 15 seconds to stay "alive"
        const interval = setInterval(ping, 15000);

        return () => clearInterval(interval);
    }, [pathname]);

    return null; // Invisible component
}
