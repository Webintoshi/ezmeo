import { createServerClient } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { OrderStatus } from "@/types/order";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    pending: "Beklemede",
    confirmed: "Onaylandı",
    preparing: "Hazırlanıyor",
    shipped: "Kargolandı",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
    refunded: "İade",
  };
  return labels[status] || status;
}

function getPaymentMethodName(paymentMethod: string, paymentGateways: any[]) {
  if (paymentMethod === "cod") return "Kapıda Ödeme";
  if (paymentMethod === "bank_transfer") return "Havale / EFT";

  const gateway = paymentGateways.find((g: any) => g.id === paymentMethod);
  return gateway?.name || "Kredi Kartı";
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default async function PrintOrderPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerClient();

  // Fetch order data
  const [orderResponse, itemsResponse, settingsResponse] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*, product:products(id, images, category, slug)").eq("order_id", id),
    supabase.from("settings").select("value").eq("key", "payment_gateways").single(),
  ]);

  if (orderResponse.error || !orderResponse.data) {
    redirect("/admin/siparisler");
  }

  const order = orderResponse.data;
  const items = itemsResponse.data || [];
  const paymentGateways = settingsResponse.data?.value || [];

  const paymentMethodName = getPaymentMethodName(order.payment_method, paymentGateways);

  // Get customer if exists
  let customer = null;
  if (order.customer_id) {
    const customerResponse = await supabase.from("customers").select("*").eq("id", order.customer_id).single();
    customer = customerResponse.data;
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Print Button - Hidden when printing */}
      <div className="no-print mb-6 flex justify-between items-center max-w-3xl mx-auto">
        <a
          href={`/admin/siparisler/${id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </a>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-800"
        >
          Yazdır
        </button>
      </div>

      {/* Invoice */}
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EZMEO</h1>
              <p className="text-gray-500 mt-1">Doğal ve Sağlıklı Ürünler</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Sipariş Numarası</p>
              <p className="text-xl font-bold text-gray-900">#{order.order_number}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Tarih</p>
              <p className="font-medium text-gray-900">{formattedDate}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Durum</p>
              <p className="font-medium text-gray-900">{getStatusLabel(order.status)}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Müşteri Bilgileri</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            {customer && (
              <p className="font-medium text-gray-900">
                {customer.first_name} {customer.last_name}
              </p>
            )}
            {order.shipping_address && (
              <>
                <p className="text-gray-700 mt-2">{order.shipping_address.address}</p>
                <p className="text-gray-700">
                  {order.shipping_address.city} / {order.shipping_address.country}
                </p>
                {order.shipping_address.phone && (
                  <p className="text-gray-700 mt-1">Tel: {order.shipping_address.phone}</p>
                )}
                {order.shipping_address.email && (
                  <p className="text-gray-700">{order.shipping_address.email}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Sipariş Ürünleri</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 text-sm font-bold text-gray-700">Ürün</th>
                <th className="text-center py-3 text-sm font-bold text-gray-700">Adet</th>
                <th className="text-right py-3 text-sm font-bold text-gray-700">Birim Fiyat</th>
                <th className="text-right py-3 text-sm font-bold text-gray-700">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-sm text-gray-500">{item.variant_name}</p>
                    )}
                  </td>
                  <td className="py-3 text-center">x{item.quantity}</td>
                  <td className="py-3 text-right">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right font-medium">{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <div className="flex justify-between py-2 text-gray-700">
            <span>Ara Toplam</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-700">
            <span>Kargo</span>
            <span>{order.shipping_cost === 0 ? "Ücretsiz" : formatPrice(order.shipping_cost)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between py-2 text-emerald-600">
              <span>İndirim</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-gray-900 text-xl font-bold">
            <span>Genel Toplam</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Ödeme Bilgileri</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Ödeme Yöntemi</span>
              <span className="font-medium text-gray-900">{paymentMethodName}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">Ödeme Durumu</span>
              <span className="font-medium text-gray-900">
                {order.payment_status === "completed" ? "Tamamlandı" :
                 order.payment_status === "pending" ? "Beklemede" :
                 order.payment_status === "processing" ? "İşleniyor" : order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        {order.tracking_number && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Kargo Bilgileri</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Kargo Firması</span>
                <span className="font-medium text-gray-900">{order.shipping_carrier || "-"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">Takip Numarası</span>
                <span className="font-medium text-gray-900">{order.tracking_number}</span>
              </div>
              {order.estimated_delivery && (
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Tahmini Teslimat</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.estimated_delivery).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Note */}
        {order.notes && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Müşteri Notu</h2>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <p className="text-gray-900">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>EZMEO - Doğal ve Sağlıklı Ürünler</p>
          <p>www.ezmeo.com</p>
          <p className="mt-1">{new Date().toLocaleDateString("tr-TR")} {new Date().toLocaleTimeString("tr-TR")}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
