"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  Home,
  Package,
  Tag,
  Users,
  Percent,
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  Store,
  Megaphone as MarketingIcon,
  Search,
  Users as AdminsIcon,
  Calculator,
} from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";
import { hasActionPermission, hasPermission, type AdminPermission, type UserRole } from "@/lib/permissions";

interface MenuItem {
  title: string;
  icon: ElementType;
  href: string;
  badge?: number;
  permission?: AdminPermission;
  submenu?: Array<{
    title: string;
    href: string;
  }>;
}

const MENU_ITEMS: MenuItem[] = [
  { title: "Ana Sayfa", icon: Home, href: "/admin" },
  {
    title: "SipariÅŸler",
    icon: Package,
    href: "/admin/siparisler",
    submenu: [
      { title: "TÃ¼m SipariÅŸler", href: "/admin/siparisler" },
      { title: "Terkedilen Sepetler", href: "/admin/siparisler/sepet-terk" },
    ],
  },
  {
    title: "ÃœrÃ¼nler",
    icon: Tag,
    href: "/admin/urunler",
    submenu: [
      { title: "TÃ¼m ÃœrÃ¼nler", href: "/admin/urunler" },
      { title: "Yeni ÃœrÃ¼n Ekle", href: "/admin/urunler/yeni" },
      { title: "Koleksiyonlar", href: "/admin/urunler/koleksiyonlar" },
      { title: "Nitelikler", href: "/admin/urunler/nitelikler" },
      { title: "Ekstralar", href: "/admin/urunler/ekstralar" },
      { title: "Toplu YÃ¼kle (CSV)", href: "/admin/urunler/toplu-yukle" },
    ],
  },
  {
    title: "MÃ¼ÅŸteriler",
    icon: Users,
    href: "/admin/musteriler",
    submenu: [
      { title: "TÃ¼m MÃ¼ÅŸteriler", href: "/admin/musteriler" },
      { title: "Segmentler", href: "/admin/musteriler/segmentler" },
      { title: "Yeni MÃ¼ÅŸteri", href: "/admin/musteriler/yeni" },
    ],
  },
  {
    title: "Ä°ndirimler",
    icon: Percent,
    href: "/admin/indirimler",
    submenu: [
      { title: "TÃ¼m Ä°ndirimler", href: "/admin/indirimler" },
      { title: "Yeni Ä°ndirim", href: "/admin/indirimler/yeni" },
      { title: "Sans Carki", href: "/admin/indirimler/sans-carki" },
    ],
  },
  {
    title: "Ä°Ã§erik",
    icon: FileText,
    href: "/admin/cms",
    submenu: [
      { title: "Blog YazÄ±larÄ±", href: "/admin/cms/blog" },
      { title: "Sayfalar", href: "/admin/cms/sayfalar" },
    ],
  },
  {
    title: "Pazarlama",
    icon: MarketingIcon,
    href: "/admin/pazarlama",
    submenu: [
      { title: "Kampanyalar", href: "/admin/pazarlama" },
      { title: "E-posta", href: "/admin/pazarlama/email" },
      { title: "SMS", href: "/admin/pazarlama/phone" },
      { title: "WhatsApp", href: "/admin/pazarlama/whatsapp" },
    ],
  },
  { title: "Analizler", icon: TrendingUp, href: "/admin/analizler" },
  {
    title: "Muhasebe",
    icon: Calculator,
    href: "/admin/muhasebe",
    permission: "accounting.view",
    submenu: [
      { title: "Genel BakÄ±ÅŸ", href: "/admin/muhasebe" },
      { title: "Fatura Entegrasyonu", href: "/admin/muhasebe/fatura-entegrasyonu" },
    ],
  },
  {
    title: "SEO AraÃ§larÄ±",
    icon: Search,
    href: "/admin/seo-killer",
    submenu: [
      { title: "SEO Kontrol", href: "/admin/seo-killer" },
      { title: "Sitemap", href: "/admin/seo-killer/sitemap" },
      { title: "Sosyal Ã–nizleme", href: "/admin/seo-killer/sosyal-onizleme" },
      { title: "HÄ±zlÄ± Ä°ndex", href: "/admin/seo-killer/hizli-index" },
    ],
  },
  { title: "Marketplace", icon: Store, href: "/admin/markets" },
  { title: "YÃ¶neticiler", icon: AdminsIcon, href: "/admin/yoneticiler" },
  {
    title: "Ayarlar",
    icon: Settings,
    href: "/admin/ayarlar",
    submenu: [
      { title: "Genel Ayarlar", href: "/admin/ayarlar/genel" },
      { title: "Kargo", href: "/admin/ayarlar/kargo" },
      { title: "Ã–deme", href: "/admin/ayarlar/odeme" },
      { title: "Bildirimler", href: "/admin/ayarlar/bildirimler" },
      { title: "Hero Banner", href: "/admin/ayarlar/hero-banner" },
      { title: "Promosyon Banner", href: "/admin/ayarlar/promosyon-banner" },
      { title: "Marquee", href: "/admin/ayarlar/marquee" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [role, setRole] = useState<UserRole>("super_admin");
  const [userName, setUserName] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const supabase = getBrowserSupabaseClient();

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const autoExpand = MENU_ITEMS.filter((item) => item.submenu?.some((sub) => sub.href === pathname)).map(
      (item) => item.title,
    );
    if (autoExpand.length === 0) return;

    setExpandedMenus((prev) => Array.from(new Set([...prev, ...autoExpand])));
  }, [pathname]);

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem("admin_user_email") || undefined;
      const storedName = localStorage.getItem("admin_user_name");
      const storedRole = localStorage.getItem("admin_user_role");

      setUserEmail(storedEmail);
      setUserName(storedName || (storedEmail?.split("@")[0] ?? "Admin KullanÄ±cÄ±"));
      if (
        storedRole === "super_admin" ||
        storedRole === "product_manager" ||
        storedRole === "content_creator" ||
        storedRole === "order_manager"
      ) {
        setRole(storedRole);
      } else {
        setRole("super_admin");
      }
    } catch (error) {
      console.error("AdminSidebar localStorage read error:", error);
      setUserName("Admin KullanÄ±cÄ±");
      setRole("super_admin");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (loading) return true;
      if (!hasPermission(role, item.href)) return false;
      if (item.permission && !hasActionPermission(role, item.permission)) return false;
      return true;
    });
  }, [loading, role]);

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isMobile && isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "bg-[#ebebeb] border-l border-gray-200 flex flex-col fixed md:sticky top-0 h-screen z-50 transition-transform duration-300",
          isMobile ? `${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"} w-80 right-0 left-auto` : "w-64",
        )}
      >
        <div className="p-4 flex items-center gap-3 border-b border-gray-200/50">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || "A"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-gray-900 block leading-tight text-sm">Webintosh Panel</span>
            <span className="text-xs text-gray-500 font-medium truncate block">
              {loading ? "Oturum aÃ§Ä±lÄ±yor..." : userName || userEmail || "Admin KullanÄ±cÄ±"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedMenus.includes(item.title);
            const hasSubmenu = Boolean(item.submenu?.length);
            const isSubmenuActive = item.submenu?.some((sub) => pathname === sub.href);

            return (
              <div key={item.title}>
                <div
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium select-none",
                    isActive || isSubmenuActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900",
                  )}
                  onClick={() => {
                    if (hasSubmenu) {
                      toggleMenu(item.title);
                    }
                  }}
                >
                  <Link href={item.href} onClick={handleLinkClick} className="flex items-center gap-3 flex-1">
                    <item.icon className="w-5 h-5 opacity-70" />
                    <span>{item.title}</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {item.badge ? (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    ) : null}
                    {hasSubmenu ? (
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    ) : null}
                  </div>
                </div>

                {hasSubmenu && isExpanded && (
                  <div className="mt-1 ml-9 space-y-0.5">
                    {item.submenu?.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={handleLinkClick}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm transition-colors",
                            isSubActive
                              ? "text-gray-900 font-medium bg-gray-200/50"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/30",
                          )}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/50 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          >
            <LogOut className="w-5 h-5 opacity-70" />
            <span>Ã‡Ä±kÄ±ÅŸ Yap</span>
          </button>
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          >
            <span className="w-5 h-5 opacity-70" />
            <span>Siteye DÃ¶n</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

