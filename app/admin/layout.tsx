"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only check auth on initial load, not on every pathname change
    if (!isInitialized) {
      if (pathname !== "/admin/login") {
        const auth = localStorage.getItem("admin_authenticated");
        setIsAuthenticated(!!auth);
        if (!auth) {
          router.push("/admin/login");
        }
      } else {
        setIsAuthenticated(true);
      }
      setIsInitialized(true);
    }
  }, [pathname, router, isInitialized]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f1f1f1]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8">{children}</div>
      </main>
    </div>
  );
}
