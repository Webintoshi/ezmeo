import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
// No imports here
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "doğal ezme",
    "fıstık ezmesi",
    "badem ezmesi",
    "katkısız ezme",
    "şekersiz ezme",
    "sporcu ezmesi",
    "fındık ezmesi",
    "antep fıstığı ezmesi",
    "vegan ezme",
    "glutensiz ezme",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  metadataBase: new URL("https://ezmeo.com"),
  icons: {
    icon: "/favicon_1.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ezmeo.com",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "./",
    languages: {
      "tr-TR": "./",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AnalyticsTracker />
        <CartProvider>
          <WishlistProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
