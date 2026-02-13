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
    <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="container mx-auto px-4 py-2.5 relative">
        <div className="flex items-center justify-center">
          <p className="text-xs sm:text-sm text-white/90 text-center font-medium tracking-wide">
            {settings.message}
            {settings.link && settings.linkText && (
              <Link
                href={settings.link}
                className="text-white font-semibold ml-1.5 hover:text-white underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all"
              >
                {settings.linkText} →
              </Link>
            )}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
        aria-label="Kapat"
      >
        <X className="w-3.5 h-3.5 text-white/60 hover:text-white" />
      </button>
    </div>
  );
}
