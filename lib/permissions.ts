export type UserRole = 'super_admin' | 'product_manager' | 'content_creator' | 'order_manager';

export const ROLES: Record<string, string> = {
    super_admin: "Süper Yönetici",
    product_manager: "Ürün Yöneticisi",
    content_creator: "İçerik Editörü",
    order_manager: "Sipariş Yöneticisi"
};

export interface AdminProfile {
    id: string;
    email: string; // Joined from auth.users
    full_name: string;
    role: UserRole;
    task_definition?: string;
    created_at: string;
}

// Define accessible paths for each role
// This can be used for sidebar filtering and page protection
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    super_admin: ["*"], // Access to everything
    product_manager: [
        "/admin",
        "/admin/urunler",
        "/admin/kategoriler",
        "/admin/ozellikler",
        "/admin/stok"
    ],
    content_creator: [
        "/admin",
        "/admin/blog",
        "/admin/sayfalar",
        "/admin/medya",
        "/admin/seo-killer"
    ],
    order_manager: [
        "/admin",
        "/admin/siparisler",
        "/admin/musteriler",
        "/admin/kuponlar",
        "/admin/sepetler"
    ]
};

export function hasPermission(role: UserRole, path: string): boolean {
    if (role === 'super_admin') return true;

    const allowedPaths = ROLE_PERMISSIONS[role];
    if (!allowedPaths) return false;

    // Check strict match or sub-path match
    return allowedPaths.some(allowed =>
        path === allowed || path.startsWith(`${allowed}/`)
    );
}

export function getRoleLabel(role: UserRole): string {
    return ROLES[role] || role;
}
