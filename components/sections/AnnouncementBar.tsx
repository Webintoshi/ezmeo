"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";

interface AnnouncementBarProps {
  message?: string;
  link?: string;
  linkText?: string;
}

export function AnnouncementBar({
  message = "🎉 İlk siparişinizde %10 indirim!",
  link = "/kampanyalar",
  linkText = "Hemen Keşfet",
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-2.5 relative">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-center">
            {message}
            <Link
              href={link}
              className="underline underline-offset-2 ml-1 sm:ml-2 font-semibold hover:text-white/90"
            >
              {linkText}
            </Link>
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors absolute right-2 sm:right-4 top-1/2 -translate-y-1/2"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
