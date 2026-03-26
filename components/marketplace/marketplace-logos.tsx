"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
}

// Logo dosya yolları - public/marketplace-logos/ klasöründe olmalı
const LOGO_PATHS: Record<string, string> = {
  trendyol: "/marketplace-logos/trendyol.png",
  hepsiburada: "/marketplace-logos/hepsiburada.png",
  n11: "/marketplace-logos/n11.png",
  amazon_tr: "/marketplace-logos/amazon-tr.png",
};

// Varsayılan placeholder logolar (SVG) - gerçek logolar yüklenene kadar
export function TrendyolLogo({ className = "", size = 40 }: LogoProps) {
  return (
    <Image
      src={LOGO_PATHS.trendyol}
      alt="Trendyol"
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        // Logo yüklenemezse placeholder göster
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div style="width:${size}px;height:${size}px;background:#F27A1A;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">TY</div>`;
        }
      }}
    />
  );
}

export function HepsiburadaLogo({ className = "", size = 40 }: LogoProps) {
  return (
    <Image
      src={LOGO_PATHS.hepsiburada}
      alt="Hepsiburada"
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,#FF6000,#FF8A00);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">HB</div>`;
        }
      }}
    />
  );
}

export function N11Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <Image
      src={LOGO_PATHS.n11}
      alt="N11"
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div style="width:${size}px;height:${size}px;background:#5D196A;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">n11</div>`;
        }
      }}
    />
  );
}

export function AmazonTrLogo({ className = "", size = 40 }: LogoProps) {
  return (
    <Image
      src={LOGO_PATHS.amazon_tr}
      alt="Amazon TR"
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div style="width:${size}px;height:${size}px;background:#232F3E;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#FF9900;font-weight:bold;font-size:14px;">a</div>`;
        }
      }}
    />
  );
}

// Çiçek Sepeti (opsiyonel)
export function CicekSepetiLogo({ className = "", size = 40 }: LogoProps) {
  return (
    <Image
      src="/marketplace-logos/ciceksepeti.png"
      alt="Çiçek Sepeti"
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div style="width:${size}px;height:${size}px;background:#E91E63;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">ÇS</div>`;
        }
      }}
    />
  );
}
