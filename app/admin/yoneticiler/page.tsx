"use client";

import { useState, useEffect } from "react";
import { Shield, Trash2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Admin, getAdmins, addAdminWithPassword, deleteAdmin } from "@/lib/admins";

export default function AdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = () => {
        setAdmins(getAdmins());
    };

    const handleAddAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Basic validation
        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Şifre en az 6 karakter olmalıdır." });
            setLoading(false);
            return;
        }

        try {
            const result = addAdminWithPassword(newEmail, newPassword);
            if (result.success) {
                setMessage({ type: "success", text: result.message });
                setNewEmail("");
                setNewPassword("");
                loadAdmins();
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Bir hata oluştu." });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = (email: string) => {
        if (confirm(`${email} yöneticisini silmek istediğinize emin misiniz?`)) {
            const result = deleteAdmin(email);
            if (result.success) {
                loadAdmins();
                setMessage({ type: "success", text: result.message });
            } else {
                setMessage({ type: "error", text: result.message });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Yöneticiler</h1>
                    <p className="text-gray-500">
                        Sistem yöneticilerini buradan yönetebilirsiniz.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Admin List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Mevcut Yöneticiler
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {admins.map((admin) => (
                                <div
                                    key={admin.email}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {admin.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{admin.email}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(admin.addedAt).toLocaleDateString("tr-TR")}
                                            </p>
                                        </div>
                                    </div>
                                    {admin.email !== "admin@ezmeo.com" && (
                                        <button
                                            onClick={() => handleDeleteAdmin(admin.email)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Yöneticiyi Sil"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    {admin.email === "admin@ezmeo.com" && (
                                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            Ana Yönetici
                                        </span>
                                    )}
                                </div>
                            ))}
                            {admins.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Hiç yönetici bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Admin Form */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Yeni Yönetici Ekle
                        </h2>

                        {message && (
                            <div
                                className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === "success"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                            >
                                {message.type === "success" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <AlertCircle className="w-4 h-4" />
                                )}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    E-posta Adresi
                                </label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="ornek@ezmeo.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Şifre
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="En az 6 karakter"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Yönetici Ekle
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
