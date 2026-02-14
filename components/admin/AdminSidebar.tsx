"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Package,
  Tag,
  Users,
  Megaphone,
  Percent,
  Globe,
  BarChart3,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  Rocket,
  Settings,
  FileText,
  Menu,
  X,
  TrendingUp,
  Store,
  Megaphone as MarketingIcon,
  Search,
  Users as AdminsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { UserRole, hasPermission } from "@/lib/permissions";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  submenu?: {
    title: string;
    href: string;
  }[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    title: "Ana Sayfa",
    icon: Home,
    href: "/admin",
  },
  {
    title: "Siparişler",
    icon: Package,
    href: "/admin/siparisler",
    submenu: [
      { title: "Tüm Siparişler", href: "/admin/siparisler" },
      { title: "Terkedilen Sepetler", href: "/admin/siparisler/sepet-terk" },
    ],
  },
  {
    title: "Ürünler",
    icon: Tag,
    href: "/admin/urunler",
    submenu: [
      { title: "Tüm Ürünler", href: "/admin/urunler" },
      { title: "Yeni Ürün Ekle", href: "/admin/urunler/yeni" },
      { title: "Koleksiyonlar", href: "/admin/urunler/koleksiyonlar" },
      { title: "Toplu Yükle (CSV)", href: "/admin/urunler/toplu-yukle" },
    ],
  },
  {
    title: "Müşteriler",
    icon: Users,
    href: "/admin/musteriler",
    submenu: [
      { title: "Tüm Müşteriler", href: "/admin/musteriler" },
      { title: "Segmentler", href: "/admin/musteriler/segmentler" },
      { title: "Yeni Müşteri", href: "/admin/musteriler/yeni" },
    ],
  },
  {
    title: "İndirimler",
    icon: Percent,
    href: "/admin/indirimler",
    submenu: [
      { title: "Tüm İndirimler", href: "/admin/indirimler" },
      { title: "Yeni İndirim", href: "/admin/indirimler/yeni" },
    ],
  },
  {
    title: "İçerik",
    icon: FileText,
    href: "/admin/cms",
    submenu: [
      { title: "Blog Yazıları", href: "/admin/cms/blog" },
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
  {
    title: "Analizler",
    icon: TrendingUp,
    href: "/admin/analizler",
  },
  {
    title: "SEO Araçları",
    icon: Search,
    href: "/admin/seo-killer",
    submenu: [
      { title: "SEO Kontrol", href: "/admin/seo-killer" },
      { title: "Sitemap", href: "/admin/seo-killer/sitemap" },
      { title: "Sosyal Önizleme", href: "/admin/seo-killer/sosyal-onizleme" },
      { title: "Hızlı İndex", href: "/admin/seo-killer/hizli-index" },
    ],
  },
  {
    title: "Marketplace",
    icon: Store,
    href: "/admin/markets",
  },
  {
    title: "Yöneticiler",
    icon: AdminsIcon,
    href: "/admin/yoneticiler",
  },
  {
    title: "Ayarlar",
    icon: Settings,
    href: "/admin/ayarlar",
    submenu: [
      { title: "Genel Ayarlar", href: "/admin/ayarlar/genel" },
      { title: "Kargo", href: "/admin/ayarlar/kargo" },
      { title: "Ödeme", href: "/admin/ayarlar/odeme" },
      { title: "Bildirimler", href: "/admin/ayarlar/bildirimler" },
      { title: "Hero Banner", href: "/admin/ayarlar/hero-banner" },
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
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen !== undefined) {
      setIsMobileMenuOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    async function getUser() {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000);
      
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email);
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, first_name, last_name")
            .eq("id", user.id)
            .single();

          if (profile) {
            setRole(profile.role);
            if (profile.first_name || profile.last_name) {
              setUserName([profile.first_name, profile.last_name].filter(Boolean).join(" "));
            }
          }
        }
      } catch (error) {
        console.error("AdminSidebar: Error fetching user:", error);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    getUser();
  }, []);

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredItems = loading 
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => {
        if (!role) return true;
        if (role === 'super_admin') return true;
        if (item.title === "Ana Sayfa") return true;
        return hasPermission(role as UserRole, item.href);
      });

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (loading) return <aside className="w-64 bg-[#ebebeb] min-h-screen border-r border-gray-200" />;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => onClose && onClose()}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-[#ebebeb] border-r border-gray-200 flex flex-col fixed md:sticky top-0 h-screen z-50 transition-transform duration-300",
        isMobile 
          ? `${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-80` 
          : 'w-64'
      )}>
        {/* Admin Header */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-200/50">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || "E"}
          </div>
          <div>
            <span className="font-semibold text-gray-900 block leading-tight">
              {userName || "Ezmeo Admin"}
            </span>
            <span className="text-xs text-gray-500 font-medium capitalize">
              {role ? role.replace("_", " ") : "Yükleniyor..."}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedMenus.includes(item.title);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuActive = item.submenu?.some(
              (sub) => pathname === sub.href
            );

            return (
              <div key={item.title}>
                <div
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium select-none",
                    isActive || isSubmenuActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                  )}
                  onClick={() =>
                    hasSubmenu ? toggleMenu(item.title) : undefined
                  }
                >
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 flex-1"
                  >
                    <item.icon className="w-5 h-5 opacity-70" />
                    <span>{item.title}</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                    {hasSubmenu && (
                      <div className="text-gray-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submenu */}
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
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/30"
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          >
            <LogOut className="w-5 h-5 opacity-70" />
            <span>Çıkış Yap</span>
          </button>
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
          >
            <span className="w-5 h-5 opacity-70" />
            <span>Siteye Dön</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
