"use client";

// Admin type
export interface Admin {
    email: string;
    addedAt: number;
}

// Default Admin Configuration
const DEFAULT_ADMIN: Admin = {
    email: "admin@ezmeo.com",
    addedAt: Date.now(),
};

const STORAGE_KEY = "ezmeo_admins";

// Initialize admins if not present
export function initializeAdmins() {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }
}

// Get all admins
export function getAdmins(): Admin[] {
    if (typeof window === "undefined") return [DEFAULT_ADMIN];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // If not stored, initialize and return default
        initializeAdmins();
        return [DEFAULT_ADMIN];
    }

    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Error parsing admins:", e);
        return [DEFAULT_ADMIN];
    }
}

// Add a new admin
export function addAdmin(email: string): { success: boolean; message: string } {
    const admins = getAdmins();

    if (admins.some((a) => a.email === email)) {
        return { success: false, message: "Bu e-posta adresi zaten kayıtlı." };
    }

    const newAdmin: Admin = {
        email,
        addedAt: Date.now(),
    };

    const updatedAdmins = [...admins, newAdmin];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAdmins));
    return { success: true, message: "Yönetici başarıyla eklendi." };
}

// Delete an admin
export function deleteAdmin(email: string): { success: boolean; message: string } {
    const admins = getAdmins();

    if (email === "admin@ezmeo.com") {
        return { success: false, message: "Varsayılan yönetici silinemez." };
    }

    if (admins.length <= 1) {
        return { success: false, message: "En az bir yönetici bulunmalıdır." };
    }

    const updatedAdmins = admins.filter((a) => a.email !== email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAdmins));
    return { success: true, message: "Yönetici başarıyla silindi." };
}

// Verify admin login (This is a simplified check, in a real app this would be server-side)
// We are trusting that if the email exists in our list, and the password matches our *global* password logic
// (Since we don't have a secure backend DB for passwords here, we'll keep the simple logic requested or slightly improved)
// For this task, user asked to "add admin". We will assume same password for all for simplicity OR 
// we simply check if email exists in the allowed list + standard password. 
// Let's assume the request implies managing ACCESS, so we check if email is in the allowed list.
// The password "admin123" seems to be shared or we can store simple passwords. 
// Let's store simple passwords for now to make it somewhat realistic? 
// The prompt didn't strictly specify password management, but "add admin" implies creating credentials.
// I'll update the logic to store passwords (insecurely in localStorage as per constraint) for this demo.

export interface AdminWithPass extends Admin {
    password?: string; // Optional for migration, but new ones will have it
}

export function authenticateAdmin(email: string, passwordInput: string): boolean {
    // Always allow fallback for default admin if storage is messed up or for initial migration
    if (email === "admin@ezmeo.com" && passwordInput === "admin123") {
        // Ensure default admin is in storage
        const admins = getAdmins();
        if (!admins.some(a => a.email === email)) {
            addAdmin(email); // Re-add default if missing
        }
        return true;
    }

    const admins = getAdmins();
    const admin = admins.find((a) => a.email === email);

    if (!admin) return false;

    // For this environment, since we haven't built a full password setting UI for the *default* one properly in previous steps,
    // we will assume a default password "admin123" for ALL admins unless we implement password storage.
    // To make it better, let's implement password storage.
    // But wait, the `addAdmin` UI needs to take a password then.
    // I will check the `getAdmins` implementation details below again.

    // Let's stick to: Any added admin uses "admin123" OR we add password param to addAdmin.
    // I will add password support to make it functional.

    // Actually, reading the file I'm writing:
    // I will store passwords in localStorage for this demo feature.

    const storedAdminsWithPass = getAdminsWithPass();
    const found = storedAdminsWithPass.find(a => a.email === email);

    if (found && found.password === passwordInput) {
        return true;
    }

    return false;
}

function getAdminsWithPass(): AdminWithPass[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function addAdminWithPassword(email: string, password: string): { success: boolean; message: string } {
    const admins = getAdminsWithPass();

    if (admins.some((a) => a.email === email)) {
        return { success: false, message: "Bu e-posta adresi zaten kayıtlı." };
    }

    const newAdmin: AdminWithPass = {
        email,
        password,
        addedAt: Date.now(),
    };

    const updatedAdmins = [...admins, newAdmin];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAdmins));
    return { success: true, message: "Yönetici başarıyla eklendi." };
}

// Initialize with default admin having password
if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const defaultWithPass: AdminWithPass = {
            email: "admin@ezmeo.com",
            password: "admin123",
            addedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultWithPass]));
    }
}
