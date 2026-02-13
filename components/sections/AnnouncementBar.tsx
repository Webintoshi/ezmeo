"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

interface AnnouncementSettings {
  message: string;
  link: string;
  linkText: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: AnnouncementSettings = {
  message: "İlk siparişinizde %10 indirim!",
  link: "/kampanyalar",
  linkText: "Hemen Keşfet",
  enabled: true,
};

export function AnnouncementBar() {
  const [settings, setSettings] = useState<AnnouncementSettings>(DEFAULT_SETTINGS);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "announcement_bar")
          .single();

        if (error) {
          console.log("Announcement settings not found, using defaults");
          return;
        }

        if (data?.value) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.value });
        }
      } catch (err) {
        console.error("Failed to fetch announcement settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  if (!isVisible || !settings.enabled || loading) return null;

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-3">
          <p className="text-xs sm:text-sm text-gray-700 text-center">
            <span className="font-medium">{settings.message}</span>
            {settings.link && settings.linkText && (
              <Link
                href={settings.link}
                className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 ml-1"
              >
                {settings.linkText}
              </Link>
            )}
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
