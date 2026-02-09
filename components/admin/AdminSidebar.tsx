"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { UserRole, hasPermission } from "@/lib/permissions";
import { useEffect } from "react";

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
      { title: "Yarım Kalan Siparişler", href: "/admin/siparisler/yarim-kalanlar" },
      { title: "Kargo Etiketleri", href: "/admin/siparisler/kargo-etiketleri" },
      { title: "İade Talepleri", href: "/admin/siparisler/iadeler" },
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
    submenu: [{ title: "Segmentler", href: "/admin/musteriler/segmentler" }],
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
    title: "Analizler",
    icon: BarChart3,
    href: "/admin/analizler",
  },
  {
    title: "Pazarlama",
    icon: Megaphone,
    href: "/admin/pazarlama",
    submenu: [
      { title: "Pazarlama Merkezi", href: "/admin/pazarlama" },
      { title: "E-posta", href: "/admin/pazarlama/email" },
      { title: "WhatsApp", href: "/admin/pazarlama/whatsapp" },
      { title: "Telefon", href: "/admin/pazarlama/phone" },
    ],
  },
  {
    title: "Markets",
    icon: Globe,
    href: "/admin/markets",
  },
  {
    title: "İçerik Yönetimi",
    icon: FileText,
    href: "/admin/cms",
    submenu: [
      { title: "Blog Yazıları", href: "/admin/cms/blog" },
      { title: "Sayfalar", href: "/admin/cms/sayfalar" },
    ],
  },
  {
    title: "SEO Killer",
    icon: Rocket,
    href: "/admin/seo-killer",
    submenu: [
      { title: "Dashboard", href: "/admin/seo-killer" },
      { title: "İç Linkleme Robotu", href: "/admin/seo-killer/ic-linkleme" },

      { title: "Hızlı İndex (Ping)", href: "/admin/seo-killer/hizli-index" },
      { title: "Sosyal Önizleme", href: "/admin/seo-killer/sosyal-onizleme" },
      { title: "Sitemap", href: "/admin/seo-killer/sitemap" },
    ],
  },
  {
    title: "Yöneticiler",
    icon: Shield,
    href: "/admin/yoneticiler",
  },
  {
    title: "Ayarlar",
    icon: Settings,
    href: "/admin/ayarlar",
    submenu: [
      { title: "Genel Ayarlar", href: "/admin/ayarlar/genel" },
      { title: "Kargo & Teslimat", href: "/admin/ayarlar/kargo" },
      { title: "Ödeme Yöntemleri", href: "/admin/ayarlar/odeme" },
      { title: "Bildirimler", href: "/admin/ayarlar/bildirimler" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "Siparişler",
    "Ürünler",
    "Müşteriler",
  ]);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/admin/login");
          return;
        }

        setUserEmail(user.email || "");

        // Get user profile for role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          setRole(profile.role);
        } else {
          // Fallback for old admins or missing profiles (treat as super_admin for safety if it's the main admin)
          if (user.email === "admin@ezmeo.com" || user.email === "webintosh") {
            setRole("super_admin");
          } else {
            setRole("product_manager"); // Default restricted
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [router]);

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("admin_authenticated"); // clear legacy
    router.push("/admin/login");
  };

  // Filter menu items based on role
  const filteredItems = MENU_ITEMS.filter(item => {
    if (!role) return false;
    if (role === 'super_admin') return true;
    if (item.title === "Ana Sayfa") return true; // Always show dashboard

    // Check if the item href matches any allowed path prefix
    return hasPermission(role as UserRole, item.href);
  });

  if (loading) return <aside className="w-64 bg-[#ebebeb] min-h-screen border-r border-gray-200" />;

  return (
    <aside className="w-64 bg-[#ebebeb] min-h-screen border-r border-gray-200 flex flex-col">
      {/* Admin Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-200/50">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          {userEmail?.[0]?.toUpperCase() || "E"}
        </div>
        <div>
          <span className="font-semibold text-gray-900 block leading-tight">Ezmeo Admin</span>
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
                  "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium select-none",
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
                        className={cn(
                          "block px-3 py-1.5 rounded-md text-sm transition-colors",
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
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          <span>Çıkış Yap</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg text-sm font-medium transition-colors"
        >
          <span className="w-5 h-5 opacity-70" />
          <span>Siteye Dön</span>
        </Link>
      </div>
    </aside>
  );
}
