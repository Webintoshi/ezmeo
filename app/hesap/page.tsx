"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Mail, Lock, User, Eye, EyeOff, ShoppingBag, Heart, MapPin, 
  LogOut, Package, ChevronRight, Loader2, Edit2, Save, X,
  Phone, Calendar, CreditCard
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "profile">("overview");
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch customer data and orders
  useEffect(() => {
    if (!user) {
      if (!authLoading) {
        router.push("/giris");
      }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch customer data
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (customerError) {
          console.error("Error fetching customer:", customerError);
        } else if (customerData) {
          setCustomer(customerData);
          setEditForm({
            firstName: customerData.first_name || "",
            lastName: customerData.last_name || "",
            phone: customerData.phone || "",
          });

          // Fetch orders
          const { data: ordersData, error: ordersError } = await supabase
            .from("orders")
            .select("*")
            .eq("customer_id", customerData.id)
            .order("created_at", { ascending: false });

          if (ordersError) {
            console.error("Error fetching orders:", ordersError);
          } else {
            setOrders(ordersData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone: editForm.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

      if (error) {
        console.error("Error updating profile:", error);
      } else {
        setCustomer({
          ...customer,
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone: editForm.phone,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-100 text-emerald-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "preparing": return "bg-amber-100 text-amber-700";
      case "pending": return "bg-gray-100 text-gray-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Beklemede";
      case "confirmed": return "Onaylandı";
      case "preparing": return "Hazırlanıyor";
      case "shipped": return "Kargolandı";
      case "delivered": return "Teslim Edildi";
      case "cancelled": return "İptal";
      case "refunded": return "İade Edildi";
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const displayName = customer ? `${customer.first_name} ${customer.last_name}` : user.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Hesabım</h1>
          <p className="text-white/80 mt-2">
            Hoş geldiniz, {displayName}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "overview", label: "Genel Bakış", icon: Package },
              { id: "orders", label: "Siparişlerim", icon: ShoppingBag },
              { id: "profile", label: "Profil", icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toplam Sipariş</p>
                      <p className="text-2xl font-bold text-gray-900">{customer?.total_orders || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toplam Harcama</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(customer?.total_spent || 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Üyelik Tarihi</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(user.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Son Siparişler</h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    Tümünü Gör
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz siparişiniz yok</h3>
                    <p className="text-gray-600 mb-4">İlk siparişinizi vererek alışverişe başlayın.</p>
                    <Link
                      href="/urunler"
                      className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#7B1113] transition-colors"
                    >
                      Alışverişe Başla
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <Link
                        key={order.id}
                        href={`/siparisler/${order.id}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">#{order.order_number}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <p className="font-bold text-gray-900 mt-1">{formatPrice(order.total)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/urunler"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ürünlere Göz At</h3>
                      <p className="text-sm text-gray-600">Yeni ürünleri keşfedin</p>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/favoriler"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Favorilerim</h3>
                      <p className="text-sm text-gray-600">Kaydedilmiş ürünler</p>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/adresler"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Adreslerim</h3>
                      <p className="text-sm text-gray-600">Teslimat adresleri</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tüm Siparişlerim</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz siparişiniz yok</h3>
                  <p className="text-gray-600 mb-4">İlk siparişinizi vererek alışverişe başlayın.</p>
                  <Link
                    href="/urunler"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#7B1113] transition-colors"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/siparisler/${order.id}`}
                      className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-gray-900">#{order.order_number}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          {order.items && order.items.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              {order.items.map(i => i.product_name).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                          <p className="text-sm text-gray-500">{order.items?.length || 0} ürün</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Profil Bilgileri</h2>
                    <p className="text-gray-600">Kişisel bilgilerinizi yönetin</p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-[#7B1113] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Düzenle
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="05XX XXX XX XX"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#7B1113] transition-colors disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Kaydet
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          İptal
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Ad Soyad</p>
                          <p className="font-semibold text-gray-900">
                            {customer?.first_name} {customer?.last_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">E-posta</p>
                          <p className="font-semibold text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Telefon</p>
                          <p className="font-semibold text-gray-900">{customer?.phone || "Belirtilmemiş"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Üyelik Tarihi</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(user.created_at).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Security Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Güvenlik</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">Şifre</p>
                      <p className="text-sm text-gray-600">Şifrenizi değiştirmek için tıklayın</p>
                    </div>
                  </div>
                  <Link
                    href="/sifremi-unuttum"
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Değiştir
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mx-auto text-red-600 hover:text-red-700 font-bold transition-colors px-6 py-3 bg-red-50 rounded-xl hover:bg-red-100"
            >
              <LogOut className="h-5 w-5" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
