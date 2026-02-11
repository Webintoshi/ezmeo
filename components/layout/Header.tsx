"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  Heart,
  ChevronRight,
  Instagram,
  Facebook,
  Home,
  Package,
  HelpCircle,
  Truck,
  User,
} from "lucide-react";
import { SITE_NAME, NAV_LINKS, ROUTES, CATEGORIES, CONTACT_INFO, SOCIAL_LINKS } from "@/lib/constants";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { searchProducts } from "@/lib/products";
import { Product } from "@/types/product";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { getTotalItems, setIsOpen: setIsCartOpen } = useCart();
  const { user } = useAuth();
  const cartItemCount = getTotalItems();
  const cartControls = useAnimation();
  const prevCartCountRef = useRef(cartItemCount);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // AJAX Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setSearchResults(searchProducts(searchQuery));
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cart Animation Logic
  useEffect(() => {
    if (cartItemCount > prevCartCountRef.current) {
      cartControls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.3 }
      });
    }
    prevCartCountRef.current = cartItemCount;
  }, [cartItemCount, cartControls]);

  // SAĞDAN AÇILAN MENU
  const menuVariants = {
    closed: { x: "100%", transition: { type: "spring" as const, stiffness: 400, damping: 40 } },
    open: { x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 40 } },
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const mobileMenuLinks = [
    { name: "Ana Sayfa", href: "/", icon: Home },
    { name: "Tüm Ürünler", href: "/urunler", icon: Package },
    { name: "SSS", href: "/sss", icon: HelpCircle },
    ...(user 
      ? [{ name: "Hesabım", href: "/hesap", icon: User }]
      : [{ name: "Giriş Yap", href: "/giris", icon: User }]
    ),
  ];

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      {/* Optional Top Bar - Minimalist */}
      <div className="bg-primary/5 border-b border-primary/5 text-[10px] font-bold text-primary uppercase tracking-[0.2em] py-1.5 flex justify-center items-center gap-2">
        <Truck className="h-3 w-3" />
        <span>500 ₺ Üzeri Siparişlerde Ücretsiz Kargo</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 lg:h-20 items-center gap-4">
          {/* LOGO - EN SOLA */}
          <Link href={ROUTES.home} className="flex items-center gap-2 transform hover:scale-105 transition-transform duration-300">
            <img src="/logo.webp" alt={SITE_NAME} className="h-10 lg:h-12 w-auto" />
          </Link>

          {/* Desktop Navigation - ORTA (sadece desktop) */}
          <nav className="hidden lg:flex items-center gap-10 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-black uppercase tracking-widest text-gray-900/70 hover:text-primary transition-all relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions - EN SAĞA */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">
            {/* Mobile Menu Toggle - EN SAĞA TAŞINDI */}
            <button
              className="lg:hidden p-2.5 hover:bg-primary/5 rounded-xl transition-all"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>

            <button
              className="p-2.5 hover:bg-primary/5 rounded-xl transition-all group"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Ara"
            >
              <Search className="h-5 w-5 text-gray-700 group-hover:text-primary transition-colors" />
            </button>

            <Link
              href="/favoriler"
              className="hidden sm:flex p-2.5 hover:bg-primary/5 rounded-xl transition-all group"
              aria-label="Favoriler"
            >
              <Heart className="h-5 w-5 text-gray-700 group-hover:text-primary transition-colors" />
            </Link>

            {/* Account Links */}
            {user ? (
              <Link
                href="/hesap"
                className="hidden sm:flex items-center gap-2 p-2.5 hover:bg-primary/5 rounded-xl transition-all group"
                aria-label="Hesabım"
              >
                <User className="h-5 w-5 text-gray-700 group-hover:text-primary transition-colors" />
              </Link>
            ) : (
              <Link
                href="/giris"
                className="hidden sm:flex items-center gap-2 p-2.5 hover:bg-primary/5 rounded-xl transition-all group"
                aria-label="Giriş Yap"
              >
                <User className="h-5 w-5 text-gray-700 group-hover:text-primary transition-colors" />
              </Link>
            )}

            <motion.button
              onClick={() => setIsCartOpen(true)}
              animate={cartControls}
              className="relative p-2.5 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all group"
              aria-label="Sepet"
            >
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M16 8V6a2 2 0 0 0-2-2H9.5a2 2 0 0 0-2 2v2" />
                  <path d="M7 8h10" />
                  <path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
                  <path d="M9.5 13a2.5 2.5 0 0 1 5 0" />
                </svg>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 h-[18px] min-w-[18px] px-1 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </div>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4 border-t border-gray-100 relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <input
                    type="search"
                    placeholder="Ürün veya kategori ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary/10 bg-[#FFF5F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium text-primary"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/5 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-primary/40" />
                    </button>
                  )}
                </div>

                {/* AJAX Search Results Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 z-[110] mt-2 bg-white rounded-2xl shadow-2xl border border-primary/5 overflow-hidden max-h-[400px] overflow-y-auto"
                    >
                      <div className="p-2">
                        <div className="px-4 py-2 border-b border-primary/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Sonuçlar ({searchResults.length})</span>
                        </div>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={ROUTES.product(product.slug)}
                            className="flex items-center gap-4 p-3 hover:bg-primary/5 rounded-xl transition-colors group"
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="w-12 h-12 rounded-lg bg-primary/5 overflow-hidden flex-shrink-0">
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[13px] font-black text-primary uppercase tracking-wider truncate">{product.name}</h4>
                              <p className="text-[11px] font-bold text-primary/60">{product.variants[0].price} ₺'den başlayan fiyatlarla</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-primary/20 group-hover:text-primary transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 w-full h-screen z-[9999] lg:hidden flex flex-col items-stretch"
              style={{ backgroundColor: '#FFF5F5', opacity: 1 }}
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-[#7B1113]/5">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <img src="/logo.webp" alt={SITE_NAME} className="h-8 w-auto" />
                </Link>
                <button
                  className="p-2 -mr-2 hover:bg-[#7B1113]/5 rounded-full transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-[#7B1113]" />
                </button>
              </div>

              {/* Minimalist Search Area */}
              <div className="px-6 pt-8 pb-4 relative">
                <div className="relative border-b border-[#7B1113]/20 pb-2 transition-colors focus-within:border-[#7B1113]">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B1113]" />
                  <input
                    type="search"
                    placeholder="SİTEDE ARA"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 bg-transparent focus:outline-none text-[11px] font-black tracking-[0.2em] text-[#7B1113] placeholder:text-[#7B1113]/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
                    >
                      <X className="h-4 w-4 text-[#7B1113]/40" />
                    </button>
                  )}
                </div>

                {/* Mobile Search Results */}
                <AnimatePresence>
                  {searchResults.length > 0 && isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-6 right-6 z-[10000] mt-2 bg-[#FFF5F5] rounded-2xl shadow-xl border border-[#7B1113]/10 overflow-hidden max-h-[300px] overflow-y-auto"
                    >
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={ROUTES.product(product.slug)}
                            className="flex items-center gap-3 p-3 hover:bg-[#7B1113]/5 rounded-xl transition-colors active:opacity-60"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-white" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black text-[#7B1113] uppercase tracking-wider truncate">{product.name}</h4>
                              <p className="text-[10px] font-bold text-[#7B1113]/60">{product.variants[0].price} ₺</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clean Navigation Area */}
              <div className="flex-1 overflow-y-auto px-6 py-8">
                <nav className="space-y-12">
                  {/* Primary Links - Vertical List */}
                  <div className="flex flex-col space-y-6">
                    {mobileMenuLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between group active:opacity-60 transition-all pl-2 -ml-2 border-l-2 border-transparent hover:border-[#7B1113]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="text-[15px] font-black text-[#7B1113] uppercase tracking-[0.15em]">
                          {link.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#7B1113]/20 group-hover:text-[#7B1113] transition-colors" />
                      </Link>
                    ))}
                  </div>

                  {/* Collections - Refined List with Thumbnails */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#7B1113]/10 pb-4">
                      <span className="text-[10px] font-black text-[#7B1113] uppercase tracking-[0.25em]">Koleksiyonlar</span>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {CATEGORIES.map((category) => (
                        <Link
                          key={category.id}
                          href={ROUTES.category(category.slug)}
                          className="flex items-center gap-5 group active:opacity-60 transition-opacity"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-12 h-12 bg-white/40 rounded-lg flex items-center justify-center text-2xl filter grayscale group-hover:grayscale-0 transition-all shadow-sm">
                            {category.icon}
                          </div>
                          <div className="flex-1 border-b border-[#7B1113]/5 pb-2 flex items-center justify-between">
                            <span className="text-[13px] font-black text-[#7B1113] uppercase tracking-widest leading-none">
                              {category.name}
                            </span>
                            <span className="text-[9px] font-black text-[#7B1113] opacity-40 uppercase tracking-widest">{category.productCount}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>

              {/* Simple Utility Footer */}
              <div className="p-8 border-t border-[#7B1113]/10 bg-[#7B1113]/5">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-[#7B1113]/40 uppercase tracking-[0.2em]">Yardım ve Destek</span>
                    <a href={`tel:${CONTACT_INFO.phone}`} className="text-sm font-black text-[#7B1113] tracking-wider hover:opacity-80 transition-opacity">
                      {CONTACT_INFO.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-6">
                      <a href={SOCIAL_LINKS.instagram} target="_blank" className="text-[#7B1113]/40 hover:text-[#7B1113] transition-all hover:scale-110">
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a href={SOCIAL_LINKS.facebook} target="_blank" className="text-[#7B1113]/40 hover:text-[#7B1113] transition-all hover:scale-110">
                        <Facebook className="h-5 w-5" />
                      </a>
                    </div>
                    <span className="text-[9px] font-black text-[#7B1113]/30 uppercase tracking-[0.2em]">
                      &copy; {SITE_NAME} PREMİUM
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
