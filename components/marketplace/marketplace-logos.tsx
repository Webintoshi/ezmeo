"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

// Trendyol Logo - Profesyonel versiyon
export function TrendyolLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Trendyol"
    >
      <rect width="48" height="48" rx="10" fill="#F27A1A" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        trendyol
      </text>
    </svg>
  );
}

// Hepsiburada Logo - Profesyonel versiyon
export function HepsiburadaLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Hepsiburada"
    >
      <defs>
        <linearGradient id="hb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6000" />
          <stop offset="100%" stopColor="#FF8A00" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#hb-gradient)" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="800"
        letterSpacing="-1"
      >
        hb
      </text>
    </svg>
  );
}

// N11 Logo - Profesyonel versiyon
export function N11Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="N11"
    >
      <rect width="48" height="48" rx="10" fill="#5D196A" />
      <text
        x="22"
        y="32"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="800"
      >
        n11
      </text>
      <circle cx="38" cy="14" r="5" fill="#E31E24" />
    </svg>
  );
}

// Amazon TR Logo - Profesyonel versiyon
export function AmazonTrLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Amazon TR"
    >
      <rect width="48" height="48" rx="10" fill="#232F3E" />
      {/* Amazon ok/smile */}
      <path
        d="M10 32C16 36 26 38 34 34"
        stroke="#FF9900"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 30L34 33L38 28"
        stroke="#FF9900"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* a harfi */}
      <text
        x="16"
        y="26"
        fill="#FF9900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="700"
      >
        a
      </text>
      {/* TR ibaresi */}
      <text
        x="34"
        y="42"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="9"
        fontWeight="700"
      >
        .tr
      </text>
    </svg>
  );
}

// Çiçek Sepeti Logo (opsiyonel)
export function CicekSepetiLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Çiçek Sepeti"
    >
      <rect width="48" height="48" rx="10" fill="#E91E63" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="700"
      >
        çiçek
      </text>
    </svg>
  );
}
