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
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Yükleniyor...</div>
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
