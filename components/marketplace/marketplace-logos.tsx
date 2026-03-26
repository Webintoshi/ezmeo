"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

// Trendyol Logo - Turuncu T harfi stilize
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
      <rect width="48" height="48" rx="8" fill="#F27A1A" />
      <path
        d="M12 14H36V18H28V36H24V18H16V14H12Z"
        fill="white"
      />
      <path
        d="M14 20H22V24H18V36H14V20Z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}

// Hepsiburada Logo - Kırmızı H harfi
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
      <rect width="48" height="48" rx="8" fill="url(#hepsiburada-gradient)" />
      <path
        d="M12 12H16V22H24V12H28V36H24V26H16V36H12V12Z"
        fill="white"
      />
      <defs>
        <linearGradient id="hepsiburada-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6000" />
          <stop offset="1" stopColor="#FF8A3D" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// N11 Logo - Mor/Pembe n11
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
      <rect width="48" height="48" rx="8" fill="#5D196A" />
      <text
        x="24"
        y="32"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="bold"
      >
        n11
      </text>
      <circle cx="38" cy="10" r="4" fill="#E31E24" />
    </svg>
  );
}

// Amazon TR Logo - Amazon smile + TR
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
      <rect width="48" height="48" rx="8" fill="#232F3E" />
      {/* Amazon ok/smile */}
      <path
        d="M8 28C12 32 20 34 28 32C32 31 36 29 38 27"
        stroke="#FF9900"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 25L38 27L40 24"
        stroke="#FF9900"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* a harfi */}
      <text
        x="16"
        y="24"
        fill="#FF9900"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="bold"
      >
        a
      </text>
      {/* TR ibaresi */}
      <text
        x="34"
        y="40"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="bold"
      >
        .tr
      </text>
    </svg>
  );
}

// Çiçek Sepeti Logo (opsiyonel - ileride eklenebilir)
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
      <rect width="48" height="48" rx="8" fill="#E91E63" />
      {/* Çiçek ikonu */}
      <circle cx="24" cy="20" r="6" fill="white" />
      <circle cx="18" cy="16" r="4" fill="#FCE4EC" />
      <circle cx="30" cy="16" r="4" fill="#FCE4EC" />
      <circle cx="18" cy="26" r="4" fill="#FCE4EC" />
      <circle cx="30" cy="26" r="4" fill="#FCE4EC" />
      {/* Sap */}
      <rect x="22" y="26" width="4" height="12" rx="2" fill="#4CAF50" />
    </svg>
  );
}

// Provider ID'ye göre logo component'ini döndüren yardımcı fonksiyon
export function getMarketplaceLogo(providerId: string, size?: number) {
  const logos: Record<string, React.ComponentType<{ size?: number }>> = {
    trendyol: TrendyolLogo,
    hepsiburada: HepsiburadaLogo,
    n11: N11Logo,
    amazon_tr: AmazonTrLogo,
    ciceksepeti: CicekSepetiLogo,
  };

  const LogoComponent = logos[providerId];
  
  if (!LogoComponent) {
    return null;
  }

  return <LogoComponent size={size} />;
}
