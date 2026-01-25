"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
} from "lucide-react";
import { SITE_NAME, NAV_LINKS, ROUTES, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItemCount] = useState(0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Banner - Kargo Ücretsiz */}
      <div className="bg-primary text-primary-foreground text-xs py-2 text-center">
        <p className="flex items-center justify-center gap-2">
          <span>🚚</span>
          <span>
            350 ₺ üzeri siparişlerde <strong>kargo ücretsiz!</strong>
          </span>
        </p>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-primary/10 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">E</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">{SITE_NAME}</h1>
              <p className="text-xs text-muted">Doğalın En Saf Hali</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                Kategoriler
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isCategoriesOpen && "rotate-180"
                  )}
                />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-primary/10 py-2">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category.id}
                      href={ROUTES.category(category.slug)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-primary/5 transition-colors"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-muted">
                          {category.productCount} ürün
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              className="p-2 hover:bg-primary/10 rounded-md transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Ara"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/favoriler"
              className="hidden sm:flex p-2 hover:bg-primary/10 rounded-md transition-colors"
              aria-label="Favoriler"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Account */}
            <Link
              href="/hesap"
              className="hidden sm:flex p-2 hover:bg-primary/10 rounded-md transition-colors"
              aria-label="Hesabım"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href={ROUTES.cart}
              className="relative p-2 hover:bg-primary/10 rounded-md transition-colors"
              aria-label="Sepet"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-primary/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="search"
                placeholder="Ürün, kategori veya tarif ara..."
                className="w-full pl-10 pr-4 py-3 rounded-full border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Menü</h2>
              <button
                className="p-2 hover:bg-primary/10 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-60px)]">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 px-4 rounded-lg hover:bg-primary/5 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-primary/10 pt-4 mt-4">
                <p className="px-4 text-sm text-muted mb-2">Kategoriler</p>
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={ROUTES.category(category.slug)}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-primary/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
