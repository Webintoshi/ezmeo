"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  TrendingUp,
  User,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Calendar,
  CreditCard,
  Star,
  MessageSquare,
  ArrowUpRight,
  Copy,
  ExternalLink,
} from "lucide-react";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  status: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  addresses: Address[];
}

interface Address {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  price: number;
  total: number;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses">("overview");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      // Fetch customer
      const customerRes = await fetch(`/api/customers?id=${id}`);
      const customerData = await customerRes.json();
      
      if (customerData.success && customerData.customer) {
        setCustomer(customerData.customer);
        
        // Fetch customer orders
        const ordersRes = await fetch(`/api/admin/customers/${id}/orders`);
        const ordersData = await ordersRes.json();
        
        if (ordersData.success && ordersData.orders) {
          setOrders(ordersData.orders);
        }
      }
    } catch (error) {
      console.error("Failed to load customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    
    const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || customer.email;
    
    if (confirm(`"${fullName}" müşterisini silmek istediğinizden emin misiniz?`)) {
      try {
        await fetch(`/api/customers?id=${id}`, { method: "DELETE" });
        router.push("/admin/musteriler");
      } catch (error) {
        console.error("Failed to delete customer:", error);
        alert("Müşteri silinirken bir hata oluştu.");
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      if (response.ok) {
        setCustomer((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      pending: { label: "Beklemede", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
      confirmed: { label: "Onaylandı", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
      preparing: { label: "Hazırlanıyor", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package },
      shipped: { label: "Kargolandı", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Truck },
      delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
      cancelled: { label: "İptal", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
      refunded: { label: "İade", color: "bg-orange-50 text-orange-700 border-orange-200", icon: ArrowLeft },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      active: { label: "Aktif", color: "bg-green-50 text-green-700 border-green-200" },
      inactive: { label: "Pasif", color: "bg-gray-100 text-gray-700 border-gray-200" },
      blocked: { label: "Engelli", color: "bg-red-50 text-red-700 border-red-200" },
    };

    const config = configs[status] || configs.active;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      cod: "Kapıda Ödeme",
      bank_transfer: "Havale/EFT",
      credit_card: "Kredi Kartı",
      paytr: "PAYTR",
      iyzico: "İyzico",
      stripe: "Stripe",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Müşteri Bulunamadı</h1>
        <p className="text-gray-500 mb-4">Aradığınız müşteri mevcut değil.</p>
        <Link href="/admin/musteriler" className="text-primary hover:underline">
          Müşterilere Dön
        </Link>
      </div>
    );
  }

  const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "İsimsiz";
  const defaultAddress = customer.addresses?.find((addr) => addr.is_default) || customer.addresses?.[0];
  const averageOrderValue = customer.total_orders > 0 
    ? customer.total_spent / customer.total_orders 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/musteriler"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {fullName}
                {getStatusBadge(customer.status)}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={customer.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="blocked">Engelli</option>
          </select>
          <Link
            href={`/admin/musteriler/${customer.id}/duzenle`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Düzenle
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Toplam Sipariş</span>
            <ShoppingBag className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{customer.total_orders}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Toplam Harcama</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(customer.total_spent)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Ortalama Sipariş</span>
            <CreditCard className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(averageOrderValue)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Son Sipariş</span>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {customer.last_order_at ? formatDate(customer.last_order_at) : "-"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Siparişler ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "addresses"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Adresler ({customer.addresses?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Son Siparişler</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-sm font-medium text-primary hover:text-red-700 flex items-center gap-1"
                >
                  Tümünü Gör
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Henüz sipariş yok.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                            #{order.order_number.split("-").pop()}
                          </div>
                          <div>
                            <Link
                              href={`/admin/siparisler/${order.id}`}
                              className="font-bold text-gray-900 hover:text-primary transition-colors"
                            >
                              {order.order_number}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {customer.notes && (
              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-amber-900">İç Notlar</h3>
                </div>
                <p className="text-amber-800 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Müşteri Bilgileri</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">E-posta</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-900 font-medium">{customer.email}</span>
                    <button
                      onClick={() => copyToClipboard(customer.email)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Kopyala"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <a
                      href={`mailto:${customer.email}`}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="E-posta Gönder"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </a>
                  </div>
                </div>

                {customer.phone && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Telefon</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-900 font-medium">{customer.phone}</span>
                      <button
                        onClick={() => copyToClipboard(customer.phone)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Kopyala"
                      >
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <a
                        href={`tel:${customer.phone}`}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Ara"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kayıt Tarihi</label>
                  <p className="text-gray-900 font-medium mt-1">{formatDateTime(customer.created_at)}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Son Güncelleme</label>
                  <p className="text-gray-900 font-medium mt-1">{formatDateTime(customer.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Default Address */}
            {defaultAddress && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    Varsayılan Adres
                  </h3>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className="text-sm font-medium text-primary hover:text-red-700"
                  >
                    Tüm Adresler
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-bold text-gray-900">
                    {defaultAddress.first_name} {defaultAddress.last_name}
                  </p>
                  <p className="text-gray-600">{defaultAddress.address_line1}</p>
                  {defaultAddress.address_line2 && (
                    <p className="text-gray-600">{defaultAddress.address_line2}</p>
                  )}
                  <p className="text-gray-900 font-medium">
                    {defaultAddress.city} / {defaultAddress.state}
                  </p>
                  <p className="text-gray-600">{defaultAddress.country}</p>
                  {defaultAddress.postal_code && (
                    <p className="text-gray-500">{defaultAddress.postal_code}</p>
                  )}
                  {defaultAddress.phone && (
                    <p className="text-gray-600 flex items-center gap-1 mt-2">
                      <Phone className="w-3.5 h-3.5" />
                      {defaultAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Tüm Siparişler</h3>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Henüz sipariş yok.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                        #{order.order_number.split("-").pop()}
                      </div>
                      <div>
                        <Link
                          href={`/admin/siparisler/${order.id}`}
                          className="font-bold text-gray-900 hover:text-primary transition-colors"
                        >
                          {order.order_number}
                        </Link>
                        <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                        <p className="text-xs text-gray-500">
                          {order.items?.length || 0} ürün
                        </p>
                      </div>
                      {getOrderStatusBadge(order.status)}
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Detay Gör"
                      >
                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                          >
                            {item.product_name}
                            {item.variant_name && ` - ${item.variant_name}`}
                            <span className="text-gray-400">x{item.quantity}</span>
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                            +{order.items.length - 3} daha
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "addresses" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {customer.addresses?.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-2xl shadow-sm border p-6 ${
                address.is_default ? "border-primary" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <h4 className="font-bold text-gray-900">
                    {address.type === "shipping" ? "Teslimat Adresi" : "Fatura Adresi"}
                  </h4>
                </div>
                {address.is_default && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                    Varsayılan
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-bold text-gray-900">
                  {address.first_name} {address.last_name}
                </p>
                <p className="text-gray-600">{address.address_line1}</p>
                {address.address_line2 && <p className="text-gray-600">{address.address_line2}</p>}
                <p className="text-gray-900 font-medium">
                  {address.city} / {address.state}
                </p>
                <p className="text-gray-500">{address.postal_code} {address.country}</p>
                {address.phone && (
                  <p className="text-gray-600 flex items-center gap-1 pt-2">
                    <Phone className="w-3.5 h-3.5" />
                    {address.phone}
                  </p>
                )}
              </div>
            </div>
          ))}

          {(!customer.addresses || customer.addresses.length === 0) && (
            <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Kayıtlı adres yok.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
